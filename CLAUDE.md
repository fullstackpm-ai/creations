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

Trello API stores all dates in UTC. When working with Trello:

- **Reading dates**: Convert UTC to PST (subtract 8 hours) before displaying to user
- **Writing dates**: Convert PST to UTC (add 8 hours) before sending to Trello API

Example: `2026-01-19T01:00:00.000Z` (UTC) = `2026-01-18 5:00 PM PST`

## Development

Work directly on main. Keep it simple. Add process after value is proven.
