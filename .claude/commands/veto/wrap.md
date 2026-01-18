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

## Example Interaction

User runs `/veto-wrap`

Ask: "Ready to wrap up the day! Any notable events or observations you'd like to record?"

Then generate the summary and present insights.
