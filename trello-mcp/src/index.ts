#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TrelloClient } from "./trello-client.js";
import {
  convertCardDueToPst,
  convertCardsDueToPst,
  pstToUtc,
} from "./utils/date.js";

const apiKey = process.env.TRELLO_API_KEY;
const token = process.env.TRELLO_TOKEN;

if (!apiKey || !token) {
  console.error(
    "Error: TRELLO_API_KEY and TRELLO_TOKEN environment variables are required"
  );
  process.exit(1);
}

const trello = new TrelloClient({ apiKey, token });

const server = new McpServer({
  name: "trello-mcp",
  version: "1.0.0",
});

// Board tools
server.tool(
  "trello_list_boards",
  "List all open Trello boards for the authenticated user",
  {},
  async () => {
    const boards = await trello.getBoards();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(boards, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "trello_get_board",
  "Get details of a specific Trello board",
  {
    board_id: z.string().describe("The ID of the board"),
  },
  async ({ board_id }) => {
    const board = await trello.getBoard(board_id);
    return {
      content: [{ type: "text", text: JSON.stringify(board, null, 2) }],
    };
  }
);

server.tool(
  "trello_create_board",
  "Create a new Trello board",
  {
    name: z.string().describe("Name of the board"),
    description: z.string().optional().describe("Description of the board"),
  },
  async ({ name, description }) => {
    const board = await trello.createBoard(name, description);
    return {
      content: [{ type: "text", text: JSON.stringify(board, null, 2) }],
    };
  }
);

server.tool(
  "trello_update_board",
  "Update a Trello board",
  {
    board_id: z.string().describe("The ID of the board"),
    name: z.string().optional().describe("New name for the board"),
    description: z.string().optional().describe("New description"),
    closed: z.boolean().optional().describe("Archive the board if true"),
  },
  async ({ board_id, name, description, closed }) => {
    const board = await trello.updateBoard(board_id, {
      name,
      desc: description,
      closed,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(board, null, 2) }],
    };
  }
);

server.tool(
  "trello_delete_board",
  "Permanently delete a Trello board",
  {
    board_id: z.string().describe("The ID of the board to delete"),
  },
  async ({ board_id }) => {
    await trello.deleteBoard(board_id);
    return {
      content: [{ type: "text", text: `Board ${board_id} deleted successfully` }],
    };
  }
);

// List tools
server.tool(
  "trello_get_lists",
  "Get all lists on a Trello board",
  {
    board_id: z.string().describe("The ID of the board"),
  },
  async ({ board_id }) => {
    const lists = await trello.getLists(board_id);
    return {
      content: [{ type: "text", text: JSON.stringify(lists, null, 2) }],
    };
  }
);

server.tool(
  "trello_create_list",
  "Create a new list on a Trello board",
  {
    board_id: z.string().describe("The ID of the board"),
    name: z.string().describe("Name of the list"),
    position: z
      .enum(["top", "bottom"])
      .optional()
      .describe("Position of the list"),
  },
  async ({ board_id, name, position }) => {
    const list = await trello.createList(board_id, name, position);
    return {
      content: [{ type: "text", text: JSON.stringify(list, null, 2) }],
    };
  }
);

server.tool(
  "trello_update_list",
  "Update a Trello list",
  {
    list_id: z.string().describe("The ID of the list"),
    name: z.string().optional().describe("New name for the list"),
    closed: z.boolean().optional().describe("Archive the list if true"),
  },
  async ({ list_id, name, closed }) => {
    const list = await trello.updateList(list_id, { name, closed });
    return {
      content: [{ type: "text", text: JSON.stringify(list, null, 2) }],
    };
  }
);

server.tool(
  "trello_archive_list",
  "Archive a Trello list",
  {
    list_id: z.string().describe("The ID of the list to archive"),
  },
  async ({ list_id }) => {
    const list = await trello.archiveList(list_id);
    return {
      content: [{ type: "text", text: JSON.stringify(list, null, 2) }],
    };
  }
);

// Card tools
server.tool(
  "trello_get_cards",
  "Get all cards in a Trello list. Due dates shown in PST.",
  {
    list_id: z.string().describe("The ID of the list"),
    exclude_completed: z
      .boolean()
      .default(false)
      .describe("Exclude cards marked as complete (dueComplete: true)"),
  },
  async ({ list_id, exclude_completed }) => {
    let cards = await trello.getCards(list_id);
    if (exclude_completed) {
      cards = cards.filter((card: { dueComplete?: boolean }) => !card.dueComplete);
    }
    const cardsWithPst = convertCardsDueToPst(cards);
    return {
      content: [{ type: "text", text: JSON.stringify(cardsWithPst, null, 2) }],
    };
  }
);

server.tool(
  "trello_get_board_cards",
  "Get all cards on a Trello board. Due dates shown in PST.",
  {
    board_id: z.string().describe("The ID of the board"),
    exclude_completed: z
      .boolean()
      .default(false)
      .describe("Exclude cards marked as complete (dueComplete: true)"),
  },
  async ({ board_id, exclude_completed }) => {
    let cards = await trello.getBoardCards(board_id);
    if (exclude_completed) {
      cards = cards.filter((card: { dueComplete?: boolean }) => !card.dueComplete);
    }
    const cardsWithPst = convertCardsDueToPst(cards);
    return {
      content: [{ type: "text", text: JSON.stringify(cardsWithPst, null, 2) }],
    };
  }
);

server.tool(
  "trello_get_card",
  "Get details of a specific Trello card. Due date shown in PST.",
  {
    card_id: z.string().describe("The ID of the card"),
  },
  async ({ card_id }) => {
    const card = await trello.getCard(card_id);
    const cardWithPst = convertCardDueToPst(card);
    return {
      content: [{ type: "text", text: JSON.stringify(cardWithPst, null, 2) }],
    };
  }
);

server.tool(
  "trello_create_card",
  "Create a new card in a Trello list. Due date input in PST, output shown in PST.",
  {
    list_id: z.string().describe("The ID of the list to add the card to"),
    name: z.string().describe("Name/title of the card"),
    description: z.string().optional().describe("Description of the card"),
    due: z
      .string()
      .optional()
      .describe("Due date in PST (e.g., 2024-12-31 or 2024-12-31T17:00)"),
    position: z
      .enum(["top", "bottom"])
      .optional()
      .describe("Position in the list"),
    label_ids: z
      .array(z.string())
      .optional()
      .describe("Array of label IDs to add to the card"),
  },
  async ({ list_id, name, description, due, position, label_ids }) => {
    const card = await trello.createCard(list_id, name, {
      desc: description,
      due: due ? pstToUtc(due) : undefined,
      pos: position,
      idLabels: label_ids,
    });
    const cardWithPst = convertCardDueToPst(card);
    return {
      content: [{ type: "text", text: JSON.stringify(cardWithPst, null, 2) }],
    };
  }
);

server.tool(
  "trello_update_card",
  "Update a Trello card. Due date input in PST, output shown in PST.",
  {
    card_id: z.string().describe("The ID of the card"),
    name: z.string().optional().describe("New name for the card"),
    description: z.string().optional().describe("New description"),
    due: z
      .string()
      .nullable()
      .optional()
      .describe("Due date in PST (e.g., 2024-12-31) or null to remove"),
    due_complete: z.boolean().optional().describe("Mark due date as complete"),
    closed: z.boolean().optional().describe("Archive the card if true"),
  },
  async ({ card_id, name, description, due, due_complete, closed }) => {
    const card = await trello.updateCard(card_id, {
      name,
      desc: description,
      due: due ? pstToUtc(due) : due,
      dueComplete: due_complete,
      closed,
    });
    const cardWithPst = convertCardDueToPst(card);
    return {
      content: [{ type: "text", text: JSON.stringify(cardWithPst, null, 2) }],
    };
  }
);

server.tool(
  "trello_move_card",
  "Move a Trello card to a different list. Due date shown in PST.",
  {
    card_id: z.string().describe("The ID of the card to move"),
    list_id: z.string().describe("The ID of the destination list"),
    position: z
      .enum(["top", "bottom"])
      .optional()
      .describe("Position in the new list"),
  },
  async ({ card_id, list_id, position }) => {
    const card = await trello.moveCard(card_id, list_id, position);
    const cardWithPst = convertCardDueToPst(card);
    return {
      content: [{ type: "text", text: JSON.stringify(cardWithPst, null, 2) }],
    };
  }
);

server.tool(
  "trello_archive_card",
  "Archive a Trello card. Due date shown in PST.",
  {
    card_id: z.string().describe("The ID of the card to archive"),
  },
  async ({ card_id }) => {
    const card = await trello.archiveCard(card_id);
    const cardWithPst = convertCardDueToPst(card);
    return {
      content: [{ type: "text", text: JSON.stringify(cardWithPst, null, 2) }],
    };
  }
);

server.tool(
  "trello_delete_card",
  "Permanently delete a Trello card",
  {
    card_id: z.string().describe("The ID of the card to delete"),
  },
  async ({ card_id }) => {
    await trello.deleteCard(card_id);
    return {
      content: [{ type: "text", text: `Card ${card_id} deleted successfully` }],
    };
  }
);

// Search tool
server.tool(
  "trello_search_cards",
  "Search for cards across Trello boards. Due dates shown in PST.",
  {
    query: z.string().describe("Search query"),
    board_id: z.string().optional().describe("Limit search to a specific board"),
    limit: z.number().optional().describe("Maximum number of results (default 10)"),
  },
  async ({ query, board_id, limit }) => {
    const results = await trello.searchCards(query, { boardId: board_id, limit });
    const cardsWithPst = convertCardsDueToPst(results.cards);
    return {
      content: [{ type: "text", text: JSON.stringify(cardsWithPst, null, 2) }],
    };
  }
);

// Label tools
server.tool(
  "trello_get_labels",
  "Get all labels on a Trello board",
  {
    board_id: z.string().describe("The ID of the board"),
  },
  async ({ board_id }) => {
    const labels = await trello.getBoardLabels(board_id);
    return {
      content: [{ type: "text", text: JSON.stringify(labels, null, 2) }],
    };
  }
);

server.tool(
  "trello_add_label_to_card",
  "Add a label to a Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
    label_id: z.string().describe("The ID of the label to add"),
  },
  async ({ card_id, label_id }) => {
    await trello.addLabelToCard(card_id, label_id);
    return {
      content: [
        { type: "text", text: `Label ${label_id} added to card ${card_id}` },
      ],
    };
  }
);

server.tool(
  "trello_remove_label_from_card",
  "Remove a label from a Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
    label_id: z.string().describe("The ID of the label to remove"),
  },
  async ({ card_id, label_id }) => {
    await trello.removeLabelFromCard(card_id, label_id);
    return {
      content: [
        { type: "text", text: `Label ${label_id} removed from card ${card_id}` },
      ],
    };
  }
);

// Checklist tools
server.tool(
  "trello_get_card_checklists",
  "Get all checklists on a Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
  },
  async ({ card_id }) => {
    const checklists = await trello.getCardChecklists(card_id);
    return {
      content: [{ type: "text", text: JSON.stringify(checklists, null, 2) }],
    };
  }
);

server.tool(
  "trello_update_check_item",
  "Update a checklist item (mark complete/incomplete or rename)",
  {
    card_id: z.string().describe("The ID of the card"),
    check_item_id: z.string().describe("The ID of the checklist item"),
    state: z
      .enum(["complete", "incomplete"])
      .optional()
      .describe("Set item state to complete or incomplete"),
    name: z.string().optional().describe("New name for the checklist item"),
  },
  async ({ card_id, check_item_id, state, name }) => {
    const item = await trello.updateCheckItem(card_id, check_item_id, {
      state,
      name,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
    };
  }
);

// Attachment tools
server.tool(
  "trello_get_card_attachments",
  "Get all attachments on a Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
  },
  async ({ card_id }) => {
    const attachments = await trello.getCardAttachments(card_id);
    return {
      content: [{ type: "text", text: JSON.stringify(attachments, null, 2) }],
    };
  }
);

// Custom Field tools
server.tool(
  "trello_get_board_custom_fields",
  "Get all custom field definitions for a Trello board",
  {
    board_id: z.string().describe("The ID of the board"),
  },
  async ({ board_id }) => {
    const fields = await trello.getBoardCustomFields(board_id);
    return {
      content: [{ type: "text", text: JSON.stringify(fields, null, 2) }],
    };
  }
);

server.tool(
  "trello_get_card_custom_fields",
  "Get all custom field values for a Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
  },
  async ({ card_id }) => {
    const items = await trello.getCardCustomFieldItems(card_id);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
    };
  }
);

server.tool(
  "trello_update_card_custom_field",
  "Update a custom field value on a Trello card. Date values in PST.",
  {
    card_id: z.string().describe("The ID of the card"),
    custom_field_id: z.string().describe("The ID of the custom field"),
    value: z
      .object({
        number: z.string().optional().describe("Value for number fields"),
        text: z.string().optional().describe("Value for text fields"),
        date: z.string().optional().describe("Value for date fields in PST (e.g., 2024-12-31)"),
        checked: z
          .enum(["true", "false"])
          .optional()
          .describe("Value for checkbox fields"),
        idValue: z.string().optional().describe("Option ID for list fields"),
      })
      .describe("The value to set (use the appropriate field for the custom field type)"),
  },
  async ({ card_id, custom_field_id, value }) => {
    // Convert date to UTC if provided
    const convertedValue = value.date
      ? { ...value, date: pstToUtc(value.date) }
      : value;
    const item = await trello.updateCardCustomField(card_id, custom_field_id, convertedValue);
    return {
      content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
    };
  }
);

server.tool(
  "trello_clear_card_custom_field",
  "Clear/remove a custom field value from a Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
    custom_field_id: z.string().describe("The ID of the custom field to clear"),
  },
  async ({ card_id, custom_field_id }) => {
    const item = await trello.clearCardCustomField(card_id, custom_field_id);
    return {
      content: [
        { type: "text", text: `Custom field ${custom_field_id} cleared from card ${card_id}` },
      ],
    };
  }
);

// Estimate (Story Points) convenience tools
server.tool(
  "trello_get_estimate",
  "Get the Estimate (story points in hours) for a Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
    board_id: z.string().describe("The ID of the board (needed to find the Estimate field)"),
  },
  async ({ card_id, board_id }) => {
    const estimate = await trello.getCardEstimate(card_id, board_id);
    if (estimate === null) {
      return {
        content: [{ type: "text", text: "No estimate set for this card" }],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ card_id, estimate_hours: estimate }, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "trello_set_estimate",
  "Set the Estimate (story points in hours) for a Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
    board_id: z.string().describe("The ID of the board (needed to find the Estimate field)"),
    hours: z.number().describe("The estimate in hours"),
  },
  async ({ card_id, board_id, hours }) => {
    const result = await trello.setCardEstimate(card_id, board_id, hours);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { card_id, estimate_hours: hours, success: true },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Trello MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
