---
description: 'Context-aware daily planning with Trello and Calendar integration'
---

# Veto Daily Planning

A unified workflow that combines cognitive assessment with task and calendar awareness to recommend what to work on.

## Overview

This command chains together multiple data sources to provide context-aware recommendations:
1. **Daily context** - What you've already done today (meetings, tasks, deep work)
2. **Current state** - Your cognitive assessment
3. **Remaining work** - Trello tasks with estimates
4. **Available time** - Free time on your calendar

## Steps

### Step 1: Gather Daily Context

First, collect what has already happened today to understand cognitive depletion.

**1a. Get today's calendar events:**
```
Call mcp__google-calendar__gcal_list_events with range: "today"
```
- Count completed meetings (events that have ended)
- Sum up meeting hours
- Note remaining meetings

**1b. Get veto segments for today:**
```
Call mcp__veto__veto_query_patterns with query_type: "deep_work_outcomes", days_back: 1
```
- Sum up deep work minutes already logged today
- Sum up shallow work minutes

**1c. Get completed Trello tasks:**
```
Call mcp__trello__trello_get_board_cards with the user's board_id
```
- Filter for cards with dueComplete: true and due date today
- Count completed tasks

### Step 2: Calculate Cognitive Depletion

Based on the context gathered, estimate cognitive load already expended:

- **Meeting hours**: Each hour of meetings = ~0.5 hours of deep work capacity lost
- **Deep work hours**: Direct deduction from capacity
- **Time of day**: Afternoon = naturally lower capacity

Calculate remaining cognitive capacity:
```
base_capacity = 4-6 hours (typical)
meetings_cost = meeting_hours * 0.5
remaining_capacity = base_capacity - deep_work_hours - meetings_cost
```

### Step 3: Assess Current State

Ask the user for their current state:
- Energy (1-10)
- Focus (1-10)
- Optional: mood, sleep hours

Call `mcp__veto__veto_assess` with their input.

### Step 4: Get Remaining Tasks

**4a. Get tasks due soon:**
```
Call mcp__trello__trello_get_cards_due_soon with board_id, days: 3, exclude_completed: true
```

**4b. For each card, get estimate if available:**
```
Call mcp__trello__trello_get_estimate with card_id, board_id
```

### Step 5: Check Available Time

```
Call mcp__google-calendar__gcal_find_free_time with date: today
```
- Identify free time blocks
- Note total available hours remaining

### Step 6: Generate Recommendations

Based on all gathered data, recommend:

1. **Work type**: Deep or shallow based on:
   - Current state (energy/focus)
   - Remaining cognitive capacity (after depletion)
   - Time of day (circadian phase)

2. **Specific tasks**: Rank tasks by:
   - Due date urgency
   - Estimate fits available time block
   - Priority/importance

3. **Time allocation**: Suggest which tasks to tackle in which time blocks

## Output Format

Present a summary like:

```
═══════════════════════════════════════
         VETO DAILY PLAN
═══════════════════════════════════════

📊 TODAY'S CONTEXT
  Meetings completed: 2 (1.5 hrs)
  Deep work logged: 1.5 hrs
  Tasks completed: 3

  → Cognitive load: MODERATE
  → Est. remaining capacity: 2-3 hrs

📍 CURRENT STATE
  Energy: 6/10 | Focus: 5/10
  Phase: Afternoon Dip

  → Recommendation: SHALLOW WORK

📅 REMAINING SCHEDULE
  2:00 PM - 3:00 PM: Free
  3:00 PM - 3:30 PM: Meeting
  3:30 PM - 5:00 PM: Free

  → Available: 2.5 hrs

📋 SUGGESTED TASKS

  For your 2:00-3:00 block (shallow):
  1. Review PR #123 (Est: 30 min)
  2. Email follow-ups (Est: 20 min)

  For your 3:30-5:00 block:
  1. Documentation updates (Est: 1 hr)
  2. Triage backlog (Est: 30 min)

═══════════════════════════════════════
```

## Configuration

The user should specify their primary Trello board ID. Ask on first use and remember for the session.

## Example Interaction

User: `/veto:daily`