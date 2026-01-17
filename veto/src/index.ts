#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import "dotenv/config";

import { vetoAssess } from "./tools/assess.js";

// Tool input schemas
const AssessInputSchema = z.object({
  energy: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("Current energy level (1-10)"),
  focus: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("Current focus level (1-10)"),
  mood: z
    .string()
    .optional()
    .describe("Current emotional state (e.g., 'calm', 'anxious', 'motivated')"),
  sleep_hours: z
    .number()
    .min(0)
    .max(24)
    .optional()
    .describe("Hours of sleep last night"),
  notes: z.string().optional().describe("Any additional context"),
});

// Create server
const server = new Server(
  {
    name: "veto",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "veto_assess",
        description: `Log your current cognitive and physiological state. Returns an Execution Profile with recommendations for what type of work suits your current condition.

This is the primary signal ingestion for Veto's trust loop. Log state at the start of work sessions to build patterns over time.

The system will:
- Record your state (energy, focus, mood, sleep)
- Determine your circadian phase
- Calculate confidence based on accumulated data
- Recommend deep or shallow work based on your patterns`,
        inputSchema: {
          type: "object",
          properties: {
            energy: {
              type: "number",
              description: "Current energy level (1-10)",
              minimum: 1,
              maximum: 10,
            },
            focus: {
              type: "number",
              description: "Current focus level (1-10)",
              minimum: 1,
              maximum: 10,
            },
            mood: {
              type: "string",
              description:
                "Current emotional state (e.g., 'calm', 'anxious', 'motivated')",
            },
            sleep_hours: {
              type: "number",
              description: "Hours of sleep last night",
              minimum: 0,
              maximum: 24,
            },
            notes: {
              type: "string",
              description: "Any additional context",
            },
          },
          required: ["energy", "focus"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "veto_assess") {
    try {
      const input = AssessInputSchema.parse(args);
      const profile = await vetoAssess(input);

      // Format response for display
      const response = formatExecutionProfile(profile);

      return {
        content: [
          {
            type: "text",
            text: response,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: `Error: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${name}`,
      },
    ],
    isError: true,
  };
});

/**
 * Format Execution Profile for human-readable output
 */
function formatExecutionProfile(profile: Awaited<ReturnType<typeof vetoAssess>>): string {
  const { current_state, recommendation, confidence } = profile;

  const lines: string[] = [
    "═══════════════════════════════════════",
    "           VETO STATE ASSESSMENT        ",
    "═══════════════════════════════════════",
    "",
    `Energy:     ${current_state.energy}/10`,
    `Focus:      ${current_state.focus}/10`,
    `Mood:       ${current_state.mood || "—"}`,
    `Sleep:      ${current_state.sleep_hours ? `${current_state.sleep_hours}h` : "—"}`,
    `Phase:      ${formatPhase(current_state.circadian_phase)}`,
    "",
    "───────────────────────────────────────",
    "",
    `Recommendation: ${recommendation.suggested_work_type.toUpperCase()} WORK`,
    "",
    recommendation.reasoning,
    "",
    "───────────────────────────────────────",
    "",
    `System confidence: ${Math.round(confidence.level * 100)}% (${confidence.status})`,
    `Data: ${confidence.days_of_data} day${confidence.days_of_data === 1 ? "" : "s"}`,
    confidence.level < 0.7
      ? "Guardrails: inactive until 70%"
      : "Guardrails: active",
    "",
    "═══════════════════════════════════════",
  ];

  return lines.join("\n");
}

function formatPhase(phase: string): string {
  const map: Record<string, string> = {
    morning_peak: "Morning Peak ☀️",
    midday: "Midday",
    afternoon_dip: "Afternoon Dip 📉",
    evening: "Evening",
    night: "Night 🌙",
  };
  return map[phase] || phase;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Veto MCP server running");
}

main().catch(console.error);
