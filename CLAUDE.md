# Claude Code Instructions

## Repository Structure

This is a mono-repo containing multiple projects:

| Project | Directory | Description |
|---------|-----------|-------------|
| veto | `/veto` | Cognitive operating system - MCP server for state tracking and guardrails |
| trello-mcp | `/trello-mcp` | MCP server for Trello integration - boards, lists, cards CRUD |

## GitHub Issues

When discovering bugs or enhancements during development, log them as issues:

```bash
echo '{"project":"veto","title":"Issue title","problem":"Description","solution":"Proposed fix","label":"enhancement"}' | .claude/hooks/create-issue.sh
```

**Labels:** `enhancement`, `bug`, `documentation`

## Timezone

User's local timezone is **PST (UTC-8)**. Always interpret and display dates/times in PST.

To get the current time, run: `date`

### Trello MCP Timezone Handling

Trello MCP automatically handles timezone conversion:

- **Reading dates**: Cards include a `duePst` field with human-readable PST time
- **Writing dates**: Input dates in PST format (e.g., `2024-12-31` or `2024-12-31T17:00`)

The server converts automatically - no manual conversion needed.

### Trello Task Planning

When helping users with task planning, scheduling, or strategy for Trello cards, **always fetch the Estimate field** to provide accurate time-based recommendations.

**Required steps for task planning requests:**

1. **Get card details** - `trello_get_card` for name, description, due date, checklists
2. **Get Estimate** - `trello_get_estimate` for hours estimate (story points)
3. **Check calendar** - `gcal_find_free_time` or `gcal_list_events` for availability
4. **Factor estimate into recommendations** - Use the hours estimate to suggest realistic scheduling

**Example triggers** (when to auto-fetch Estimate):
- "What's a good strategy to finish this task?"
- "How should I plan my day around this card?"
- "Can I complete this task today?"
- "Help me schedule work on this Trello card"
- Any task planning, time management, or workload assessment request

**Example response pattern:**
```
The task "[Card Name]" has an estimate of 5 hours.
You have 3 free hours this afternoon (2-5 PM).
Recommendation: Start today, plan to complete tomorrow morning.
```

## Development

Work directly on main. Keep it simple. Add process after value is proven.
