---
description: 'Context-aware daily planning with Trello and Calendar integration'
---

# Veto Daily Planning

## When to Use

**`/veto:daily` is the primary entry point for Veto.** Use it:

- At the **start of your work day** (morning planning)
- **After a long break** (lunch, meetings) to re-orient
- When you need **full context**: calendar, tasks, estimates, recommendations

**What it does:**
1. Checks calendar and available time
2. Fetches tasks from Trello (due soon + overdue)
3. Collects or reuses your state assessment
4. Presents a comprehensive daily plan with recommendations

**Don't want full planning?** Use `/veto:assess` for a quick state log without the overhead.

---

**EXECUTE THIS WORKFLOW IMMEDIATELY. Do not describe what you will do - actually do it.**

## Step 1: Gather Daily Context (run in parallel)

Call these tools simultaneously:

1. `mcp__google-calendar__gcal_list_events` with `range: "today"` - get today's meetings
2. `mcp__veto__veto_query_patterns` with `query_type: "deep_work_outcomes"`, `days_back: 1` - get today's work segments
3. `mcp__trello__trello_list_boards` - get user's boards (to identify primary board)
4. `mcp__google-calendar__gcal_find_free_time` with today's date - get available time blocks
5. `mcp__veto__veto_get_today_state` - check if user already logged state today

## Step 2: Get Current Time and Tasks

After Step 1 completes:

1. Run `date` to get current time
2. Call these in parallel:
   - `mcp__trello__trello_get_cards_due_soon` with the primary board_id, `days: 3`, `include_completed: false`
   - `mcp__trello__trello_get_overdue_cards` with the primary board_id, `include_completed: false`

## Step 3: Get Task Estimates

For each card returned in Step 2 (both due soon AND overdue), call `mcp__trello__trello_get_estimate` with card_id and board_id.

## Step 4: Check or Ask for Current State

**If `veto_get_today_state` returned an existing assessment:**

Check how long ago it was logged (from `hours_ago` field):

- **If < 3 hours ago**: Use the existing state. Present it briefly:
  "Using your earlier assessment (Energy X/10, Focus X/10). Has anything changed since then?"
  - If user says no → proceed to Step 6 (skip Step 5)
  - If user says yes → ask what changed and proceed to Step 5

- **If >= 3 hours ago**: Ask if the earlier state still applies or if they want to log fresh values:
  "You logged state X hours ago (Energy X, Focus X). Want to use that or update?"

**If no assessment exists today:**

Use `AskUserQuestion` to ask the user:
- Energy level (1-10)
- Focus level (1-10)
- Hours of sleep last night

Then proceed to Step 5.

## Step 5: Log State Assessment (if needed)

Call `mcp__veto__veto_assess` with the user's responses.

**Skip this step** if using an existing assessment from earlier today.

## Step 6: Calculate and Present Daily Plan

### Identifying Self-Blocked Deep Work Time

Events with these keywords in the title are **protected deep work time**, NOT meetings:
- "Blocked Time"
- "Focus Time"
- "Deep Work"
- "Hold"

When processing calendar events:
1. **Do NOT count these as meeting hours** - they don't deplete cognitive capacity
2. **Show them as available deep work blocks** in the schedule (use ░░░ instead of ▓▓▓)
3. **Include their duration in "Available" time calculation**

### Cognitive Depletion Calculation

Calculate cognitive depletion:
- Meeting hours × 0.5 = cognitive cost (exclude self-blocked events)
- Base capacity (4-6 hrs) - deep work done - meeting cost = remaining capacity

Present a formatted summary:

```
═══════════════════════════════════════════════════════════════
                      VETO DAILY PLAN
                   [Day], [Date] · [Time]
═══════════════════════════════════════════════════════════════

📍 CURRENT STATE
   Energy: X/10 | Focus: X/10 | Sleep: Xh
   Phase: [Morning Peak/Midday/Afternoon Dip/Evening]

   → Recommendation: [DEEP WORK / SHALLOW WORK]

───────────────────────────────────────────────────────────────

📊 TODAY'S CONTEXT
   Meetings completed: X (X hrs)
   Deep work logged: X hrs
   Tasks completed: X

   → Cognitive load: [FRESH/LIGHT/MODERATE/HEAVY]
   → Est. remaining capacity: X-X hrs

───────────────────────────────────────────────────────────────

📅 SCHEDULE
   [Visual representation of today's calendar]

   Legend: ▓▓▓ = meetings  ░░░ = deep work blocks (self-blocked)

   → Available: X hrs (includes self-blocked deep work time)

───────────────────────────────────────────────────────────────

📋 TASKS DUE

   [OVERDUE section - show first with ⚠️ warning if any exist]
   [TODAY section if applicable]
   [TOMORROW section if applicable]
   [Later section if applicable]

───────────────────────────────────────────────────────────────

🎯 RECOMMENDED PLAN

   [Specific task recommendations matched to time blocks]

═══════════════════════════════════════════════════════════════
```

## Step 7: Offer to Start Segment

Use a structured flow to offer starting a work segment (same experience as `/veto:start`):

### 7a. Ask Work Type

Use `AskUserQuestion` to ask:
- **question**: "Would you like to start a work segment?"
- **header**: "Start"
- **options**:
  - **Deep work** - "Cognitively demanding, requires sustained focus"
  - **Shallow work** - "Administrative, routine tasks"
  - **Not now** - "Skip starting a segment"

If user selects "Not now", end the workflow.

### 7b. Present Task Options

Use `AskUserQuestion` to present the tasks fetched in Steps 2-3 as selectable options:
- **question**: "What will you work on?"
- **header**: "Task"
- **options**: Build from the due/overdue cards (max 4 options):
  - Format each as: `"[Card name]"` with description `"Due: [date] | Est: [X]h"` or `"OVERDUE | Est: [X]h"`
  - Prioritize: overdue first, then by due date
  - Include estimates fetched in Step 3
  - User can always select "Other" for a custom task

### 7c. Start Segment and Move Card

1. Call `mcp__veto__veto_start_segment` with:
   - `intended_type`: "deep" or "shallow" based on 7a
   - `description`: The selected task name
   - `trello_card_id`: The card ID (if a Trello task was selected)

2. **If a Trello card was selected**, automatically move it to "In Progress":
   - Get the board's lists using `mcp__trello__trello_get_lists`
   - Find the list named "In Progress" or "Doing" (case-insensitive)
   - Move the card using `mcp__trello__trello_move_card`
   - If no "In Progress" list found, skip and inform user

3. Confirm: "Started [deep/shallow] segment: [task]. Call `/veto:end` when done."

## Notes

- Primary Trello board: If multiple boards exist, use "My Trello board" (68031b17e0ef40f25b75d2ab) as default
- Always fetch Estimate field for task planning
- Order tasks by Leverage field if available, then by due date
