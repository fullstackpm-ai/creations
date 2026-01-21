---
description: 'Context-aware daily planning with Trello and Calendar integration'
---

# Veto Daily Planning

**EXECUTE THIS WORKFLOW IMMEDIATELY. Do not describe what you will do - actually do it.**

## Step 1: Gather Daily Context (run in parallel)

Call these tools simultaneously:

1. `mcp__google-calendar__gcal_list_events` with `range: "today"` - get today's meetings
2. `mcp__veto__veto_query_patterns` with `query_type: "deep_work_outcomes"`, `days_back: 1` - get today's work segments
3. `mcp__trello__trello_list_boards` - get user's boards (to identify primary board)
4. `mcp__google-calendar__gcal_find_free_time` with today's date - get available time blocks

## Step 2: Get Current Time and Tasks

After Step 1 completes:

1. Run `date` to get current time
2. Call `mcp__trello__trello_get_cards_due_soon` with the primary board_id, `days: 3`, `include_completed: false`

## Step 3: Get Task Estimates

For each card returned in Step 2, call `mcp__trello__trello_get_estimate` with card_id and board_id.

## Step 4: Ask for Current State

Use `AskUserQuestion` to ask the user:
- Energy level (1-10)
- Focus level (1-10)
- Hours of sleep last night

## Step 5: Log State Assessment

Call `mcp__veto__veto_assess` with the user's responses.

## Step 6: Calculate and Present Daily Plan

Calculate cognitive depletion:
- Meeting hours × 0.5 = cognitive cost
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

   → Available: X hrs

───────────────────────────────────────────────────────────────

📋 TASKS DUE

   [TODAY section if applicable]
   [TOMORROW section if applicable]
   [Later section if applicable]

───────────────────────────────────────────────────────────────

🎯 RECOMMENDED PLAN

   [Specific task recommendations matched to time blocks]

═══════════════════════════════════════════════════════════════
```

## Step 7: Offer to Start Segment

Ask if the user wants to start tracking a work segment on any of the recommended tasks.

## Notes

- Primary Trello board: If multiple boards exist, use "My Trello board" (68031b17e0ef40f25b75d2ab) as default
- Always fetch Estimate field for task planning
- Order tasks by Leverage field if available, then by due date
