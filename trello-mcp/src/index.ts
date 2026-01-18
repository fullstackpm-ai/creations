#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TrelloClient } from "./trello-client.js";

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
  "Get all cards in a Trello list",
  {
    list_id: z.string().describe("The ID of the list"),
  },
  async ({ list_id }) => {
    const cards = await trello.getCards(list_id);
    return {
      content: [{ type: "text", text: JSON.stringify(cards, null, 2) }],
    };
  }
);

server.tool(
  "trello_get_board_cards",
  "Get all cards on a Trello board",
  {
    board_id: z.string().describe("The ID of the board"),
  },
  async ({ board_id }) => {
    const cards = await trello.getBoardCards(board_id);
    return {
      content: [{ type: "text", text: JSON.stringify(cards, null, 2) }],
    };
  }
);

server.tool(
  "trello_get_card",
  "Get details of a specific Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
  },
  async ({ card_id }) => {
    const card = await trello.getCard(card_id);
    return {
      content: [{ type: "text", text: JSON.stringify(card, null, 2) }],
    };
  }
);

server.tool(
  "trello_create_card",
  "Create a new card in a Trello list",
  {
    list_id: z.string().describe("The ID of the list to add the card to"),
    name: z.string().describe("Name/title of the card"),
    description: z.string().optional().describe("Description of the card"),
    due: z
      .string()
      .optional()
      .describe("Due date in ISO 8601 format (e.g., 2024-12-31)"),
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
      due,
      pos: position,
      idLabels: label_ids,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(card, null, 2) }],
    };
  }
);

server.tool(
  "trello_update_card",
  "Update a Trello card",
  {
    card_id: z.string().describe("The ID of the card"),
    name: z.string().optional().describe("New name for the card"),
    description: z.string().optional().describe("New description"),
    due: z
      .string()
      .nullable()
      .optional()
      .describe("Due date (ISO 8601) or null to remove"),
    due_complete: z.boolean().optional().describe("Mark due date as complete"),
    closed: z.boolean().optional().describe("Archive the card if true"),
  },
  async ({ card_id, name, description, due, due_complete, closed }) => {
    const card = await trello.updateCard(card_id, {
      name,
      desc: description,
      due,
      dueComplete: due_complete,
      closed,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(card, null, 2) }],
    };
  }
);

server.tool(
  "trello_move_card",
  "Move a Trello card to a different list",
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
    return {
      content: [{ type: "text", text: JSON.stringify(card, null, 2) }],
    };
  }
);

server.tool(
  "trello_archive_card",
  "Archive a Trello card",
  {
    card_id: z.string().describe("The ID of the card to archive"),
  },
  async ({ card_id }) => {
    const card = await trello.archiveCard(card_id);
    return {
      content: [{ type: "text", text: JSON.stringify(card, null, 2) }],
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
  "Search for cards across Trello boards",
  {
    query: z.string().describe("Search query"),
    board_id: z.string().optional().describe("Limit search to a specific board"),
    limit: z.number().optional().describe("Maximum number of results (default 10)"),
  },
  async ({ query, board_id, limit }) => {
    const results = await trello.searchCards(query, { boardId: board_id, limit });
    return {
      content: [{ type: "text", text: JSON.stringify(results.cards, null, 2) }],
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
