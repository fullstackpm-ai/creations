---
description: 'Start tracking a work segment (deep or shallow)'
---

# Veto Start Segment

Begin tracking a focused work block. Only one segment can be active at a time.

## Steps

1. Ask the user for segment details:
   - **Type** (required): "deep" or "shallow" work
   - **Description** (optional): Brief description of what they're working on

2. Call the `mcp__veto__veto_start_segment` tool with:
   - `intended_type`: The work type
   - `description`: What they're working on (if provided)

3. Confirm the segment has started and remind the user to call `/veto-end` when done.

## Example Interaction

User runs `/veto-start`

Ask: "What type of work are you starting?
- **deep**: Cognitively demanding, requires sustained focus
- **shallow**: Administrative, routine tasks

Optional: What will you be working on?"

Then start the segment and confirm.
