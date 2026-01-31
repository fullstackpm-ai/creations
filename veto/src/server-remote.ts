#!/usr/bin/env node
/**
 * Veto Remote MCP Server
 *
 * A minimal remote MCP server for mobile access to capture functionality.
 * Designed to be deployed to Railway, Render, or any Node.js hosting.
 *
 * Exposes only:
 * - veto_capture: Capture ideas/actions
 * - veto_get_today_state: Check today's state assessment
 *
 * Authentication: Simple bearer token via VETO_API_TOKEN env var
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import "dotenv/config";

import { vetoCapture } from "./tools/capture.js";
import { vetoGetTodayState } from "./tools/get-today-state.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const API_TOKEN = process.env.VETO_API_TOKEN;

if (!API_TOKEN) {
  console.error("ERROR: VETO_API_TOKEN environment variable is required");
  process.exit(1);
}

// Tool schemas
const CaptureInputSchema = z.object({
  content: z.string().min(1).describe("The idea or action item to capture"),
  type: z
    .enum(["idea", "action"])
    .optional()
    .describe("Type: 'idea' for thoughts, 'action' for follow-ups"),
  urgency: z
    .enum(["now", "today", "later"])
    .optional()
    .describe("Urgency level"),
});

// Create MCP server
const server = new Server(
  {
    name: "veto-mobile",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools - only capture and get_today_state
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "veto_capture",
        description: `Capture an idea or action item quickly.

Use this to capture thoughts without breaking flow:
- Ideas: Random thoughts that pop up
- Actions: Follow-ups and tasks

Captures are stored and can be routed later via /veto:wrap.`,
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The idea or action to capture",
            },
            type: {
              type: "string",
              enum: ["idea", "action"],
              description: "Type: 'idea' or 'action'",
            },
            urgency: {
              type: "string",
              enum: ["now", "today", "later"],
              description: "Urgency: 'now', 'today', or 'later'",
            },
          },
          required: ["content"],
        },
      },
      {
        name: "veto_get_today_state",
        description: `Get today's state assessment if one exists.

Returns energy, focus, mood, sleep from this morning's assessment.`,
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "veto_capture": {
        const input = CaptureInputSchema.parse(args);
        const result = await vetoCapture(input);
        return {
          content: [
            {
              type: "text",
              text: formatCapture(result),
            },
          ],
        };
      }

      case "veto_get_today_state": {
        const result = await vetoGetTodayState();
        return {
          content: [
            {
              type: "text",
              text: formatGetTodayState(result),
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// Formatting functions
function formatCapture(result: Awaited<ReturnType<typeof vetoCapture>>): string {
  const { capture } = result;
  const typeIcon = capture.capture_type === "idea" ? "💡" : "✅";
  const urgencyLabel =
    capture.urgency === "now" ? "⚡NOW" : capture.urgency === "today" ? "📅TODAY" : "📥LATER";

  return `${typeIcon} Captured: "${capture.content}" [${urgencyLabel}]`;
}

function formatGetTodayState(result: Awaited<ReturnType<typeof vetoGetTodayState>>): string {
  const { has_assessment, state_log, message } = result;

  if (!has_assessment || !state_log) {
    return "No state assessment today. Use /veto:assess to log one.";
  }

  return `Today's state: Energy ${state_log.energy}/10, Focus ${state_log.focus}/10${state_log.mood ? `, Mood: ${state_log.mood}` : ""}`;
}

// Simple bearer token auth middleware
function authenticate(req: IncomingMessage, res: ServerResponse): boolean {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing or invalid Authorization header" }));
    return false;
  }

  const token = authHeader.slice(7);
  if (token !== API_TOKEN) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid token" }));
    return false;
  }

  return true;
}

// Create HTTP server with MCP transport
async function main() {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
  });

  await server.connect(transport);

  const httpServer = createServer(async (req, res) => {
    // CORS headers for Claude.ai
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id");

    // Handle preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check endpoint (no auth required)
    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", server: "veto-mobile" }));
      return;
    }

    // MCP endpoint - requires auth
    if (req.url?.startsWith("/mcp") || req.url === "/") {
      if (!authenticate(req, res)) {
        return;
      }

      try {
        await transport.handleRequest(req, res);
      } catch (error) {
        console.error("MCP error:", error);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal server error" }));
        }
      }
      return;
    }

    // 404 for unknown routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  httpServer.listen(PORT, () => {
    console.log(`Veto Remote MCP server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  });
}

main().catch(console.error);
