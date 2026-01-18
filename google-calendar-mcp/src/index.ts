#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CalendarClient } from "./calendar-client.js";

// Validate credentials
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required"
  );
  process.exit(1);
}

const calendar = new CalendarClient(clientId, clientSecret);

const server = new McpServer({
  name: "google-calendar",
  version: "1.0.0",
});

// Helper to resolve time ranges
function resolveTimeRange(
  range: "today" | "tomorrow" | "week" | "custom",
  startDate?: string,
  endDate?: string
): { timeMin: Date; timeMax: Date } {
  const now = new Date();

  if (range === "today") {
    const timeMin = new Date(now);
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date(now);
    timeMax.setHours(23, 59, 59, 999);
    return { timeMin, timeMax };
  }

  if (range === "tomorrow") {
    const timeMin = new Date(now);
    timeMin.setDate(timeMin.getDate() + 1);
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date(timeMin);
    timeMax.setHours(23, 59, 59, 999);
    return { timeMin, timeMax };
  }

  if (range === "week") {
    const timeMin = new Date(now);
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date(now);
    timeMax.setDate(timeMax.getDate() + 7);
    timeMax.setHours(23, 59, 59, 999);
    return { timeMin, timeMax };
  }

  // Custom range
  if (!startDate || !endDate) {
    throw new Error("start_date and end_date required for custom range");
  }
  return {
    timeMin: new Date(startDate),
    timeMax: new Date(endDate),
  };
}

// Tool: List events
server.tool(
  "gcal_list_events",
  "List calendar events for today, tomorrow, this week, or a custom date range. Times displayed in PST.",
  {
    range: z
      .enum(["today", "tomorrow", "week", "custom"])
      .default("today")
      .describe("Time range: today, tomorrow, week, or custom"),
    start_date: z
      .string()
      .optional()
      .describe("Start date (ISO 8601) for custom range"),
    end_date: z
      .string()
      .optional()
      .describe("End date (ISO 8601) for custom range"),
    calendar_id: z
      .string()
      .default("primary")
      .describe("Calendar ID (default: primary)"),
    max_results: z
      .number()
      .default(50)
      .describe("Maximum number of events to return"),
  },
  async ({ range, start_date, end_date, calendar_id, max_results }) => {
    try {
      const { timeMin, timeMax } = resolveTimeRange(
        range,
        start_date,
        end_date
      );
      const events = await calendar.listEvents(
        calendar_id,
        timeMin,
        timeMax,
        max_results
      );

      if (events.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No events found for ${range === "custom" ? "the specified range" : range}.`,
            },
          ],
        };
      }

      const formatted = events
        .map(
          (e) =>
            `- ${e.summary}\n  ${e.start} - ${e.end}${e.location ? `\n  Location: ${e.location}` : ""}`
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Events for ${range === "custom" ? "custom range" : range} (${events.length}):\n\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Find free time
server.tool(
  "gcal_find_free_time",
  "Find available time blocks in your calendar. Useful for planning focus time or scheduling meetings.",
  {
    date: z
      .string()
      .optional()
      .describe("Date to check (YYYY-MM-DD format, default: today)"),
    duration_minutes: z
      .number()
      .default(60)
      .describe("Minimum block duration in minutes"),
    start_hour: z
      .number()
      .default(9)
      .describe("Earliest hour to consider (0-23, default: 9)"),
    end_hour: z
      .number()
      .default(18)
      .describe("Latest hour to consider (0-23, default: 18)"),
    calendar_id: z
      .string()
      .default("primary")
      .describe("Calendar ID (default: primary)"),
  },
  async ({ date, duration_minutes, start_hour, end_hour, calendar_id }) => {
    try {
      const targetDate = date ? new Date(date) : new Date();

      const freeBlocks = await calendar.findFreeTime(
        calendar_id,
        targetDate,
        duration_minutes,
        start_hour,
        end_hour
      );

      if (freeBlocks.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No free blocks of ${duration_minutes}+ minutes found between ${start_hour}:00 and ${end_hour}:00.`,
            },
          ],
        };
      }

      const formatted = freeBlocks
        .map((b) => `- ${b.start} to ${b.end} (${b.durationMinutes} min)`)
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Free time blocks (${duration_minutes}+ min) on ${targetDate.toLocaleDateString()}:\n\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Get event details
server.tool(
  "gcal_get_event",
  "Get detailed information about a specific calendar event",
  {
    event_id: z.string().describe("The event ID"),
    calendar_id: z
      .string()
      .default("primary")
      .describe("Calendar ID (default: primary)"),
  },
  async ({ event_id, calendar_id }) => {
    try {
      const event = await calendar.getEvent(calendar_id, event_id);

      const details = [
        `Summary: ${event.summary}`,
        `Start: ${event.start}`,
        `End: ${event.end}`,
        event.location ? `Location: ${event.location}` : null,
        event.description ? `Description: ${event.description}` : null,
        event.attendees?.length
          ? `Attendees: ${event.attendees.join(", ")}`
          : null,
        event.htmlLink ? `Link: ${event.htmlLink}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return {
        content: [{ type: "text", text: details }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Create event
server.tool(
  "gcal_create_event",
  "Create a new calendar event. Perfect for blocking focus time or scheduling meetings.",
  {
    summary: z.string().describe("Event title"),
    start: z
      .string()
      .describe("Start time (ISO 8601 format, e.g., 2024-01-15T09:00:00)"),
    end: z
      .string()
      .describe("End time (ISO 8601 format, e.g., 2024-01-15T11:00:00)"),
    description: z.string().optional().describe("Event description"),
    location: z.string().optional().describe("Event location"),
    calendar_id: z
      .string()
      .default("primary")
      .describe("Calendar ID (default: primary)"),
    color_id: z
      .string()
      .optional()
      .describe("Event color (1-11, see Google Calendar colors)"),
  },
  async ({
    summary,
    start,
    end,
    description,
    location,
    calendar_id,
    color_id,
  }) => {
    try {
      const event = await calendar.createEvent(calendar_id, {
        summary,
        start,
        end,
        description,
        location,
        colorId: color_id,
      });

      return {
        content: [
          {
            type: "text",
            text: `Event created!\n\nSummary: ${event.summary}\nStart: ${event.start}\nEnd: ${event.end}${event.htmlLink ? `\nLink: ${event.htmlLink}` : ""}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Update event
server.tool(
  "gcal_update_event",
  "Update an existing calendar event",
  {
    event_id: z.string().describe("The event ID to update"),
    summary: z.string().optional().describe("New event title"),
    start: z.string().optional().describe("New start time (ISO 8601 format)"),
    end: z.string().optional().describe("New end time (ISO 8601 format)"),
    description: z.string().optional().describe("New event description"),
    location: z.string().optional().describe("New event location"),
    calendar_id: z
      .string()
      .default("primary")
      .describe("Calendar ID (default: primary)"),
    color_id: z.string().optional().describe("New event color (1-11)"),
  },
  async ({
    event_id,
    summary,
    start,
    end,
    description,
    location,
    calendar_id,
    color_id,
  }) => {
    try {
      const event = await calendar.updateEvent(calendar_id, event_id, {
        summary,
        start,
        end,
        description,
        location,
        colorId: color_id,
      });

      return {
        content: [
          {
            type: "text",
            text: `Event updated!\n\nSummary: ${event.summary}\nStart: ${event.start}\nEnd: ${event.end}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool: Delete event
server.tool(
  "gcal_delete_event",
  "Delete a calendar event",
  {
    event_id: z.string().describe("The event ID to delete"),
    calendar_id: z
      .string()
      .default("primary")
      .describe("Calendar ID (default: primary)"),
  },
  async ({ event_id, calendar_id }) => {
    try {
      await calendar.deleteEvent(calendar_id, event_id);

      return {
        content: [
          {
            type: "text",
            text: `Event deleted successfully.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Calendar MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
