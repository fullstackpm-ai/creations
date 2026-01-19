---
description: 'Start tracking a work segment (deep or shallow)'
---

# Veto Start Segment

Begin tracking a focused work block. Only one segment can be active at a time.

## Steps

1. Ask the user for segment details:
   - **Type** (required): "deep" or "shallow" work
   - **Description** (optional): Brief description of what they're working on
   - **Trello Card** (optional): If working on a Trello task, get the card ID

2. Call the `mcp__veto__veto_start_segment` tool with:
   - `intended_type`: The work type
   - `description`: What they're working on (if provided)
   - `trello_card_id`: The Trello card ID (if provided)

3. **If a Trello card was specified**, automatically move it to "In Progress":
   - First, get the card details using `mcp__trello__trello_get_card` to find the board ID
   - Get the board's lists using `mcp__trello__trello_get_lists`
   - Find the list named "In Progress" or "Doing" (case-insensitive)
   - Move the card using `mcp__trello__trello_move_card` to that list
   - If no "In Progress" list is found, skip the move and inform the user

4. Confirm the segment has started and remind the user to call `/veto:end` when done.

## Example Interaction

User runs `/veto:start`

Ask: "What type of work are you starting?
- **deep**: Cognitively demanding, requires sustained focus
- **shallow**: Administrative, routine tasks

Optional: What will you be working on?

Optional: Are you working on a Trello card? If so, provide the card ID and I'll move it to In Progress."

Then start the segment and move the Trello card if provided.

## Trello Integration

When a `trello_card_id` is provided:
1. The segment is linked to the card for future correlation/analytics
2. The card is automatically moved to the "In Progress" list
3. This eliminates manual board updates when starting work
