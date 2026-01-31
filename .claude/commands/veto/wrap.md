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

5. **Tomorrow's Prep Check**: Fetch tomorrow's calendar and surface meetings that need prep work:
   - Call `mcp__google-calendar__gcal_list_events` with `range: "tomorrow"`
   - Categorize meetings into two tiers:

   **HIGH-STAKES** (prep is real deep work, not buffer time):
     - `interview` (any direction - conducting or being interviewed)
     - `review` (performance, design, architecture)
     - `strategy`, `planning`, `kickoff`
     - `board`, `exec`, `leadership`
     - Meetings with external stakeholders, clients, or partners
     - First-time 1:1s with new people

   **STANDARD PREP** (lighter prep needed):
     - Recurring 1:1s (skim notes, update agenda)
     - `sync` meetings over 30 minutes
     - Meetings you're presenting in

   **EXCLUDE** (no prep needed):
     - Self-blocked time (`Blocked`, `Focus`, `Hold`, `Deep Work`)
     - All-day reminder events
     - Recurring standups under 30 min
     - Meetings you're just attending (no active role)

   - Display the prep check with high-stakes meetings emphasized:

   ```
   ═══════════════════════════════════════
           TOMORROW'S PREP CHECK
   ═══════════════════════════════════════

   ⚠️  HIGH-STAKES (block prep time):
   • [time] - [meeting title]

   📋 Standard prep:
   • [time] - [meeting title]

   ═══════════════════════════════════════
   ```

   - If there are HIGH-STAKES meetings, use `AskUserQuestion`:
     - **question**: `"Want me to block prep time on your calendar for these high-stakes meetings?"`
     - **header**: `"Prep time"`
     - **options**:
       - **Yes, block time** - "Create 30-60 min prep blocks tomorrow morning"
       - **No thanks** - "I'll handle prep myself"

   - If user chooses to block time:
     1. Call `mcp__google-calendar__gcal_find_free_time` for tomorrow with `start_hour: 8`, `end_hour: 12`, `duration_minutes: 30`
     2. For each high-stakes meeting, create a prep block before the earliest available slot using `mcp__google-calendar__gcal_create_event`:
        - Title: `"Prep: [meeting name]"`
        - Duration: 30-60 min depending on meeting type (interviews/reviews get 60 min)
        - Description: `"Deep work block for meeting prep. Treat as focus time."`
     3. Confirm what was created

   - If no meetings need prep, skip this section entirely (don't show "no meetings")

6. **Route Captures Interactively**: If the wrap_day result contains captures (ideas or actions), iterate through each one and help the user route it:

   For each capture (process actions first by urgency, then ideas):

   **Step A**: Display the capture with YOUR RECOMMENDATION as regular text BEFORE the option picker:
   ```
   ═══════════════════════════════════════════════════════════════
   CAPTURE [1/N] — [💡 IDEA / ✅ ACTION] [⚡NOW / 📅TODAY / 📥LATER]
   ═══════════════════════════════════════════════════════════════

   "[Full capture content here]"

   ┌─────────────────────────────────────────────────────────────┐
   │ 🤖 RECOMMENDATION: [Your suggested action]                  │
   │                                                             │
   │ [Brief reasoning - 1-2 sentences max]                       │
   └─────────────────────────────────────────────────────────────┘
   ```

   **How to generate recommendations:**
   Analyze the capture content and recommend ONE of these actions:

   - **Dismiss** if:
     - Already completed or no longer relevant
     - Vague with no clear next action ("think about X sometime")
     - Superseded by other work done today

   - **Complete** if:
     - It was a quick reminder that's been handled
     - A one-time note that doesn't need tracking

   - **Trello** if:
     - It's a concrete task with clear scope
     - Relates to ongoing project work
     - Suggest specific list: "Inbox", "Blocked", etc.

   - **GitHub** if:
     - It's a bug or technical enhancement
     - Relates to a specific codebase
     - Would benefit from issue tracking/discussion

   Mark your top recommendation with "(Recommended)" in the options.

   **Step B**: Then use `AskUserQuestion` with options ordered by your recommendation:
   - **question**: `"Route this capture?"`
   - **header**: `"Route"`
   - **options** (put recommended option FIRST with "(Recommended)" suffix):
      - **[Recommended action] (Recommended)** - "[reason]"
      - **Complete** - "Mark as done"
      - **Trello** - "Create a Trello card"
      - **GitHub** - "Create a GitHub issue"
      - **Dismiss** - "Discard"

   **IMPORTANT**: The capture content and recommendation MUST be displayed as text output BEFORE calling AskUserQuestion. The option picker UI truncates long text, so the capture must be fully visible above it.

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
