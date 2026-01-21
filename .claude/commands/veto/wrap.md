---
description: 'Generate daily summary and close out the work day'
---

# Veto Wrap Day

Generate a daily summary and close out the day. Call this at the end of your work day.

## Steps

1. Optionally ask the user for any notable events or observations from today.

2. Call the `mcp__veto__veto_wrap_day` tool with:
   - `notable_events`: Any observations provided

3. Present the daily summary:
   - Completion ratio across segments
   - Mean focus score
   - Energy trend throughout the day
   - Total deep work minutes
   - Total shallow work minutes
   - Any override events that need post-hoc assessment

4. If there were overrides, ask the user to reflect on whether they regret the override decision (this feeds the learning system).

5. **Tomorrow's Prep Check**: Fetch tomorrow's calendar and surface meetings that may need prep:
   - Call `mcp__google-calendar__gcal_list_events` with `range: "tomorrow"`
   - Filter for meetings that likely need prep:
     - **Include**: Meetings with keywords: `1:1`, `interview`, `review`, `planning`, `sync`, `strategy`, `kickoff`
     - **Include**: Meetings with external attendees or unfamiliar names
     - **Include**: Meetings over 30 minutes
     - **Exclude**: Self-blocked time (`Blocked`, `Focus`, `Hold`, `Deep Work`)
     - **Exclude**: All-day reminder events
     - **Exclude**: Recurring standups or quick syncs under 30 min
   - Display a simple reminder block:

   ```
   ═══════════════════════════════════════
           TOMORROW'S PREP CHECK
   ═══════════════════════════════════════

   These meetings may need prep:

   • [time] - [meeting title]
   • [time] - [meeting title]

   Consider prepping tonight or protecting
   morning time tomorrow.

   ═══════════════════════════════════════
   ```

   - If no meetings need prep, skip this section entirely (don't show "no meetings")

## Example Interaction

User runs `/veto-wrap`

Ask: "Ready to wrap up the day! Any notable events or observations you'd like to record?"

Then generate the summary and present insights.
