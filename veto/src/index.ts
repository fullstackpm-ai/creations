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
import { vetoStartSegment } from "./tools/start-segment.js";
import { vetoEndSegment } from "./tools/end-segment.js";
import { vetoEditSegment } from "./tools/edit-segment.js";
import { vetoLogSegment } from "./tools/log-segment.js";
import { vetoListSegments } from "./tools/list-segments.js";
import { vetoWrapDay } from "./tools/wrap-day.js";
import { vetoQueryPatterns } from "./tools/query-patterns.js";
import { vetoPlan } from "./tools/plan.js";

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

const StartSegmentInputSchema = z.object({
  intended_type: z
    .enum(["deep", "shallow"])
    .describe("Type of work segment (deep or shallow)"),
  description: z
    .string()
    .optional()
    .describe("Brief description of what you're working on"),
  state_log_id: z
    .string()
    .optional()
    .describe("ID of the state log from veto_assess (for correlation)"),
  trello_card_id: z
    .string()
    .optional()
    .describe("Trello card ID to link this segment to (for task correlation)"),
});

const EndSegmentInputSchema = z.object({
  focus_score: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("How focused were you during this segment? (1-10)"),
  completed: z
    .boolean()
    .optional()
    .default(true)
    .describe("Did you complete what you intended?"),
  notes: z.string().optional().describe("Any observations or notes"),
  duration_minutes: z
    .number()
    .int()
    .min(1)
    .max(1440)
    .optional()
    .describe("Override calculated duration with actual minutes worked (1-1440)"),
});

const EditSegmentInputSchema = z.object({
  segment_id: z.string().describe("ID of the segment to edit"),
  focus_score: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("New focus score (1-10)"),
  completed: z.boolean().optional().describe("Update completion status"),
  description: z.string().optional().describe("Update description"),
  notes: z.string().optional().describe("Add notes (appended to existing)"),
  duration_minutes: z
    .number()
    .int()
    .min(1)
    .max(1440)
    .optional()
    .describe("Adjust duration (recalculates end_time)"),
});

const LogSegmentInputSchema = z.object({
  intended_type: z
    .enum(["deep", "shallow"])
    .describe("Type of work segment (deep or shallow)"),
  start_time: z
    .string()
    .describe("When the segment started (ISO, 'HH:MM', 'X hours ago', 'X minutes ago')"),
  duration_minutes: z
    .number()
    .int()
    .min(1)
    .max(1440)
    .describe("How long the segment lasted in minutes"),
  focus_score: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("How focused were you? (1-10)"),
  completed: z
    .boolean()
    .optional()
    .default(true)
    .describe("Did you complete what you intended?"),
  description: z.string().optional().describe("What you worked on"),
  notes: z.string().optional().describe("Any observations"),
  trello_card_id: z.string().optional().describe("Link to Trello card"),
});

const ListSegmentsInputSchema = z.object({
  date: z
    .string()
    .optional()
    .describe("Date to query: 'today', 'yesterday', or YYYY-MM-DD (default: today)"),
  intended_type: z
    .enum(["deep", "shallow"])
    .optional()
    .describe("Filter by segment type"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Maximum number of segments to return (default: 20)"),
});

const WrapDayInputSchema = z.object({
  notable_events: z
    .string()
    .optional()
    .describe("Any notable events or observations from today"),
});

const QueryPatternsInputSchema = z.object({
  query_type: z
    .enum([
      "deep_work_outcomes",
      "state_correlation",
      "override_accuracy",
      "confidence_factors",
    ])
    .describe("Type of pattern query"),
  energy_range: z
    .object({
      min: z.number().min(1).max(10),
      max: z.number().min(1).max(10),
    })
    .optional()
    .describe("Filter by energy range"),
  focus_range: z
    .object({
      min: z.number().min(1).max(10),
      max: z.number().min(1).max(10),
    })
    .optional()
    .describe("Filter by focus range"),
  circadian_phase: z
    .enum(["morning_peak", "midday", "afternoon_dip", "evening", "night"])
    .optional()
    .describe("Filter by circadian phase"),
  days_back: z
    .number()
    .int()
    .min(1)
    .max(90)
    .optional()
    .default(14)
    .describe("How many days back to query (default: 14)"),
});

const PlanInputSchema = z.object({
  intended_work_type: z
    .enum(["deep", "shallow"])
    .optional()
    .describe("What type of work are you planning to do?"),
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
      {
        name: "veto_start_segment",
        description: `Start tracking a work segment. Call this when you begin a focused work block.

The segment will remain open until you call veto_end_segment. Only one segment can be active at a time.

Use this to establish execution boundaries and track what you intended to do.

If a trello_card_id is provided, the segment will be linked to that Trello card for correlation tracking.`,
        inputSchema: {
          type: "object",
          properties: {
            intended_type: {
              type: "string",
              enum: ["deep", "shallow"],
              description: "Type of work segment (deep or shallow)",
            },
            description: {
              type: "string",
              description: "Brief description of what you're working on",
            },
            state_log_id: {
              type: "string",
              description:
                "ID of the state log from veto_assess (for correlation)",
            },
            trello_card_id: {
              type: "string",
              description:
                "Trello card ID to link this segment to (for task correlation)",
            },
          },
          required: ["intended_type"],
        },
      },
      {
        name: "veto_end_segment",
        description: `End the current work segment. Call this when you finish or stop a focused work block.

Records the outcome (focus score, completion status) for learning. This data feeds the pattern recognition that enables guardrails.`,
        inputSchema: {
          type: "object",
          properties: {
            focus_score: {
              type: "number",
              description: "How focused were you during this segment? (1-10)",
              minimum: 1,
              maximum: 10,
            },
            completed: {
              type: "boolean",
              description: "Did you complete what you intended?",
              default: true,
            },
            notes: {
              type: "string",
              description: "Any observations or notes",
            },
            duration_minutes: {
              type: "number",
              description: "Override calculated duration with actual minutes worked. Use when reporting a segment after the fact.",
              minimum: 1,
              maximum: 1440,
            },
          },
          required: ["focus_score"],
        },
      },
      {
        name: "veto_edit_segment",
        description: `Edit a past segment from today. Use this to correct mistakes like wrong focus score or update notes.

Can only edit segments from the current day. Changes are logged for audit trail.`,
        inputSchema: {
          type: "object",
          properties: {
            segment_id: {
              type: "string",
              description: "ID of the segment to edit",
            },
            focus_score: {
              type: "number",
              description: "New focus score (1-10)",
              minimum: 1,
              maximum: 10,
            },
            completed: {
              type: "boolean",
              description: "Update completion status",
            },
            description: {
              type: "string",
              description: "Update description",
            },
            notes: {
              type: "string",
              description: "Add notes (appended to existing)",
            },
            duration_minutes: {
              type: "number",
              description: "Adjust duration in minutes (recalculates end_time)",
              minimum: 1,
              maximum: 1440,
            },
          },
          required: ["segment_id"],
        },
      },
      {
        name: "veto_log_segment",
        description: `Log a completed segment retroactively. Use this when you forgot to start/end a segment and want to record it after the fact.

Supports flexible time formats: ISO timestamp, "HH:MM", "X hours ago", "X minutes ago".`,
        inputSchema: {
          type: "object",
          properties: {
            intended_type: {
              type: "string",
              enum: ["deep", "shallow"],
              description: "Type of work (deep or shallow)",
            },
            start_time: {
              type: "string",
              description: "When the segment started (ISO, 'HH:MM', '2 hours ago', '30 minutes ago')",
            },
            duration_minutes: {
              type: "number",
              description: "How long the segment lasted in minutes",
              minimum: 1,
              maximum: 1440,
            },
            focus_score: {
              type: "number",
              description: "How focused were you? (1-10)",
              minimum: 1,
              maximum: 10,
            },
            completed: {
              type: "boolean",
              description: "Did you complete what you intended?",
              default: true,
            },
            description: {
              type: "string",
              description: "What you worked on",
            },
            notes: {
              type: "string",
              description: "Any observations",
            },
            trello_card_id: {
              type: "string",
              description: "Link to Trello card",
            },
          },
          required: ["intended_type", "start_time", "duration_minutes", "focus_score"],
        },
      },
      {
        name: "veto_list_segments",
        description: `List segments for a given date. Use this to review work logged or find segment IDs for editing.

Returns segments with their IDs, times, durations, focus scores, and completion status. Also provides summary stats.`,
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description:
                "Date to query: 'today', 'yesterday', or YYYY-MM-DD (default: today)",
            },
            intended_type: {
              type: "string",
              enum: ["deep", "shallow"],
              description: "Filter by segment type",
            },
            limit: {
              type: "number",
              description: "Maximum number of segments to return (default: 20)",
              minimum: 1,
              maximum: 100,
            },
          },
        },
      },
      {
        name: "veto_wrap_day",
        description: `Generate a daily summary and close out the day. Call this at the end of your work day.

Aggregates all segments, calculates metrics (completion ratio, mean focus, energy trend), and creates a daily summary record. Also surfaces any override events that need post-hoc assessment.`,
        inputSchema: {
          type: "object",
          properties: {
            notable_events: {
              type: "string",
              description: "Any notable events or observations from today",
            },
          },
        },
      },
      {
        name: "veto_query_patterns",
        description: `Query the Learning DB for insights and patterns. Use this to understand your historical performance.

Query types:
- deep_work_outcomes: How did deep work go in similar states?
- state_correlation: Which states correlate with good/poor outcomes?
- override_accuracy: How often do overrides lead to regret?
- confidence_factors: What's driving the current confidence level?`,
        inputSchema: {
          type: "object",
          properties: {
            query_type: {
              type: "string",
              enum: [
                "deep_work_outcomes",
                "state_correlation",
                "override_accuracy",
                "confidence_factors",
              ],
              description: "Type of pattern query",
            },
            energy_range: {
              type: "object",
              properties: {
                min: { type: "number", minimum: 1, maximum: 10 },
                max: { type: "number", minimum: 1, maximum: 10 },
              },
              description: "Filter by energy range",
            },
            focus_range: {
              type: "object",
              properties: {
                min: { type: "number", minimum: 1, maximum: 10 },
                max: { type: "number", minimum: 1, maximum: 10 },
              },
              description: "Filter by focus range",
            },
            circadian_phase: {
              type: "string",
              enum: [
                "morning_peak",
                "midday",
                "afternoon_dip",
                "evening",
                "night",
              ],
              description: "Filter by circadian phase",
            },
            days_back: {
              type: "number",
              description: "How many days back to query (default: 14)",
              minimum: 1,
              maximum: 90,
            },
          },
          required: ["query_type"],
        },
      },
      {
        name: "veto_plan",
        description: `Generate a daily plan with guardrail logic. Call this to check if deep work is recommended.

Based on your current state and historical patterns, the system may:
- Recommend deep or shallow work
- Refuse deep work if patterns predict poor outcomes (when confidence >= 70%)
- Provide evidence for its recommendation

If the guardrail refuses deep work, you can override, defer, or switch to shallow work.`,
        inputSchema: {
          type: "object",
          properties: {
            intended_work_type: {
              type: "string",
              enum: ["deep", "shallow"],
              description: "What type of work are you planning to do?",
            },
          },
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
      case "veto_assess": {
        const input = AssessInputSchema.parse(args);
        const profile = await vetoAssess(input);
        return {
          content: [
            {
              type: "text",
              text: formatExecutionProfile(profile),
            },
          ],
        };
      }

      case "veto_start_segment": {
        const input = StartSegmentInputSchema.parse(args);
        const result = await vetoStartSegment(input);
        return {
          content: [
            {
              type: "text",
              text: formatStartSegment(result),
            },
          ],
        };
      }

      case "veto_end_segment": {
        const input = EndSegmentInputSchema.parse(args);
        const result = await vetoEndSegment(input);
        return {
          content: [
            {
              type: "text",
              text: formatEndSegment(result),
            },
          ],
        };
      }

      case "veto_edit_segment": {
        const input = EditSegmentInputSchema.parse(args);
        const result = await vetoEditSegment(input);
        return {
          content: [
            {
              type: "text",
              text: formatEditSegment(result),
            },
          ],
        };
      }

      case "veto_log_segment": {
        const input = LogSegmentInputSchema.parse(args);
        const result = await vetoLogSegment(input);
        return {
          content: [
            {
              type: "text",
              text: formatLogSegment(result),
            },
          ],
        };
      }

      case "veto_list_segments": {
        const input = ListSegmentsInputSchema.parse(args);
        const result = await vetoListSegments(input);
        return {
          content: [
            {
              type: "text",
              text: formatListSegments(result),
            },
          ],
        };
      }

      case "veto_wrap_day": {
        const input = WrapDayInputSchema.parse(args);
        const result = await vetoWrapDay(input);
        return {
          content: [
            {
              type: "text",
              text: formatWrapDay(result),
            },
          ],
        };
      }

      case "veto_query_patterns": {
        const input = QueryPatternsInputSchema.parse(args);
        const result = await vetoQueryPatterns(input);
        return {
          content: [
            {
              type: "text",
              text: formatQueryPatterns(result),
            },
          ],
        };
      }

      case "veto_plan": {
        const input = PlanInputSchema.parse(args);
        const result = await vetoPlan(input);
        return {
          content: [
            {
              type: "text",
              text: formatPlan(result),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
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
});

// Formatting functions

function formatExecutionProfile(
  profile: Awaited<ReturnType<typeof vetoAssess>>
): string {
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

function formatStartSegment(
  result: Awaited<ReturnType<typeof vetoStartSegment>>
): string {
  const { segment, message } = result;
  const lines: string[] = [
    "═══════════════════════════════════════",
    "          SEGMENT STARTED               ",
    "═══════════════════════════════════════",
    "",
    message,
    "",
    `Type:        ${segment.intended_type.toUpperCase()}`,
    `Started:     ${new Date(segment.start_time).toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles" })}`,
    segment.description ? `Description: ${segment.description}` : "",
    segment.trello_card_id ? `Trello Card: ${segment.trello_card_id}` : "",
    "",
    "End with veto_end_segment when done.",
    "",
    "═══════════════════════════════════════",
  ].filter(Boolean);

  return lines.join("\n");
}

function formatEndSegment(
  result: Awaited<ReturnType<typeof vetoEndSegment>>
): string {
  const { segment, duration_minutes, message } = result;
  const lines: string[] = [
    "═══════════════════════════════════════",
    "          SEGMENT ENDED                 ",
    "═══════════════════════════════════════",
    "",
    message,
    "",
    `Duration:    ${duration_minutes} minutes`,
    `Focus:       ${segment.focus_score}/10`,
    `Completed:   ${segment.completed ? "Yes" : "No"}`,
    "",
    "═══════════════════════════════════════",
  ];

  return lines.join("\n");
}

function formatEditSegment(
  result: Awaited<ReturnType<typeof vetoEditSegment>>
): string {
  const { segment, changes, message } = result;
  const lines: string[] = [
    "═══════════════════════════════════════",
    "          SEGMENT EDITED                ",
    "═══════════════════════════════════════",
    "",
    message,
    "",
  ];

  if (changes.length > 0) {
    lines.push("Changes:");
    for (const change of changes) {
      lines.push(`  • ${change}`);
    }
    lines.push("");
  }

  lines.push(`Segment ID: ${segment.id}`);
  lines.push("");
  lines.push("═══════════════════════════════════════");

  return lines.join("\n");
}

function formatLogSegment(
  result: Awaited<ReturnType<typeof vetoLogSegment>>
): string {
  const { segment, message } = result;
  const lines: string[] = [
    "═══════════════════════════════════════",
    "          SEGMENT LOGGED                ",
    "═══════════════════════════════════════",
    "",
    message,
    "",
    `Type:        ${segment.intended_type.toUpperCase()}`,
    `Started:     ${new Date(segment.start_time).toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles" })}`,
    `Ended:       ${segment.end_time ? new Date(segment.end_time).toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles" }) : "—"}`,
    `Focus:       ${segment.focus_score}/10`,
    `Completed:   ${segment.completed ? "Yes" : "No"}`,
    segment.description ? `Description: ${segment.description}` : "",
    "",
    "═══════════════════════════════════════",
  ].filter(Boolean);

  return lines.join("\n");
}

function formatListSegments(
  result: Awaited<ReturnType<typeof vetoListSegments>>
): string {
  const { message } = result;
  const lines: string[] = [
    "═══════════════════════════════════════",
    "          SEGMENTS LIST                 ",
    "═══════════════════════════════════════",
    "",
    message,
    "",
    "═══════════════════════════════════════",
  ];

  return lines.join("\n");
}

function formatWrapDay(
  result: Awaited<ReturnType<typeof vetoWrapDay>>
): string {
  const { summary, segments_today, override_reviews, message } = result;
  const lines: string[] = [
    "═══════════════════════════════════════",
    "          DAY WRAPPED                   ",
    "═══════════════════════════════════════",
    "",
    message,
    "",
  ];

  if (override_reviews.length > 0) {
    lines.push("───────────────────────────────────────");
    lines.push("");
    lines.push("OVERRIDES NEEDING ASSESSMENT:");
    for (const review of override_reviews) {
      lines.push(
        `  • ${review.description || "Unnamed segment"} (focus: ${review.focus_score ?? "?"})`
      );
    }
    lines.push("");
    lines.push("Did these overrides turn out well?");
    lines.push("[Y] Yes  [N] No  [M] Mixed");
    lines.push("");
  }

  lines.push("═══════════════════════════════════════");

  return lines.join("\n");
}

function formatQueryPatterns(
  result: Awaited<ReturnType<typeof vetoQueryPatterns>>
): string {
  const { query_type, data, message } = result;
  const lines: string[] = [
    "═══════════════════════════════════════",
    "          PATTERN QUERY                 ",
    "═══════════════════════════════════════",
    "",
    `Query: ${query_type}`,
    "",
    message,
    "",
    "───────────────────────────────────────",
    "",
    JSON.stringify(data, null, 2),
    "",
    "═══════════════════════════════════════",
  ];

  return lines.join("\n");
}

function formatPlan(result: Awaited<ReturnType<typeof vetoPlan>>): string {
  const { current_state, recommendation, guardrail, message } = result;

  const lines: string[] = [
    "═══════════════════════════════════════",
    "          VETO PLAN                     ",
    "═══════════════════════════════════════",
    "",
  ];

  if (current_state) {
    lines.push(`Energy:     ${current_state.energy}/10`);
    lines.push(`Focus:      ${current_state.focus}/10`);
    lines.push(`Phase:      ${formatPhase(current_state.circadian_phase)}`);
    lines.push("");
    lines.push("───────────────────────────────────────");
    lines.push("");
  }

  lines.push(message);
  lines.push("");

  if (guardrail.active && !guardrail.refusing) {
    lines.push(`Guardrails: active (${Math.round(guardrail.confidence * 100)}% confidence)`);
    lines.push(`Recommendation: ${recommendation.toUpperCase()} WORK`);
  }

  lines.push("");
  lines.push("═══════════════════════════════════════");

  return lines.join("\n");
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Veto MCP server running");
}

main().catch(console.error);
