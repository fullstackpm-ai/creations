---
description: 'End the current work segment and record outcome'
---

# Veto End Segment

End the current work segment and record the outcome for learning.

## Steps

1. Ask the user about their segment:
   - **Focus score** (1-10, required): How focused were they during the segment?
   - **Completed** (optional, default true): Did they complete what they intended?
   - **Notes** (optional): Any observations
   - **Duration override** (optional): If reporting after the fact, actual minutes worked

2. Call the `mcp__veto__veto_end_segment` tool with the provided values.

3. **Get accurate time context** (run in parallel):
   - Run `date` to get the **current time** (REQUIRED - never estimate time from memory)
   - Call `mcp__google-calendar__gcal_list_events` with `range: "today"` to get remaining events

4. Present the results:
   - Segment duration
   - Focus score recorded
   - Completion status
   - **Time until next event** (calculated from current time from step 3, NOT estimated)
   - Any pattern insights

## Time Calculation Rule

**CRITICAL**: When stating time until next event:
1. Always use the current time from the `date` command (step 3)
2. Find the next event that starts AFTER current time
3. Calculate: `next_event_start - current_time = time_remaining`
4. Never rely on mental arithmetic or stale time data from earlier in the conversation

## Example Interaction

User runs `/veto:end`

Ask: "How did the work session go?
- Focus score (1-10): How focused were you?
- Did you complete what you intended? (yes/no)
- Any notes or observations?"

Then end the segment, check current time + calendar, and report:
- Segment completed (X minutes, focus: Y/10)
- Current time: [from date command]
- Next event: [event name] at [time] (in X hours Y minutes)
