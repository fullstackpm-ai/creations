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

6. **Route Captures Interactively**: If the wrap_day result contains captures (ideas or actions), iterate through each one and help the user route it:

   For each capture (process actions first by urgency, then ideas):

   **Step A**: Display the capture content as regular text output BEFORE the option picker:
   ```
   ───────────────────────────────────────
   CAPTURE [1/N] — [💡 IDEA / ✅ ACTION] [⚡NOW / 📅TODAY / 📥LATER]
   ───────────────────────────────────────

   "[Full capture content here]"

   ```

   **Step B**: Then use `AskUserQuestion` with a short question:
   - **question**: `"What would you like to do with this capture?"`
   - **header**: `"Route"`
   - **options**:
      - **Complete** - "Mark as done (handled or no longer relevant)"
      - **Trello** - "Create a card on my Trello board"
      - **GitHub** - "Create a GitHub issue"
      - **Dismiss** - "Discard this capture"
      - (User can also type custom response via "Other")

   **IMPORTANT**: The capture content MUST be displayed as text output BEFORE calling AskUserQuestion. This ensures the user can see the full capture text, as the option picker UI can obscure long question text.

   Based on user's choice:
      - **Complete now**: Call `mcp__veto__veto_route_capture` with `action: "complete"`
      - **Create Trello card**:
        1. Call `mcp__trello__trello_get_lists` with board_id `68031b17e0ef40f25b75d2ab`
        2. Ask user which list to add to (default to first non-Done list)
        3. Call `mcp__trello__trello_create_card` with the capture content as name
        4. Call `mcp__veto__veto_route_capture` with `action: "trello"` and `routed_to: card_url`
      - **Create GitHub issue**:
        1. Ask user for repo (default: `fullstackpm-ai/creations`)
        2. Run `gh issue create --repo [repo] --title "[capture content]" --body "Captured during veto wrap on [date]"`
        3. Call `mcp__veto__veto_route_capture` with `action: "github"` and `routed_to: issue_url`
      - **Dismiss**: Call `mcp__veto__veto_route_capture` with `action: "dismiss"`
      - **Other/Skip**: Call `mcp__veto__veto_route_capture` with `action: "skip"`

   Show brief confirmation and move to next capture.

   After all captures are processed, show summary:
   ```
   ═══════════════════════════════════════
           CAPTURES ROUTED
   ═══════════════════════════════════════

   ✓ Completed: X
   📋 To Trello: X
   🐙 To GitHub: X
   🗑️ Dismissed: X
   ⏭️ Skipped: X

   ═══════════════════════════════════════
   ```

## Example Interaction

User runs `/veto-wrap`

Ask: "Ready to wrap up the day! Any notable events or observations you'd like to record?"

Then generate the summary, show tomorrow's prep, and walk through each capture interactively.
