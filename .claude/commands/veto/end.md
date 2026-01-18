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

3. Present the results:
   - Segment duration
   - Focus score recorded
   - Completion status
   - Any pattern insights

## Example Interaction

User runs `/veto-end`

Ask: "How did the work session go?
- Focus score (1-10): How focused were you?
- Did you complete what you intended? (yes/no)
- Any notes or observations?"

Then end the segment and report results.
