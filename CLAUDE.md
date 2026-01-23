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

## Shell Command Best Practices

### jq Filters

When using jq to filter JSON output, always use **single quotes** around the filter expression to prevent shell interpretation issues:

```bash
# CORRECT - single quotes prevent shell expansion
jq '.[] | select(.due != null)'

# WRONG - do not escape ! as \! (causes jq syntax error)
jq ".[] | select(.due \!= null)"
```

The `!` character in `!=` triggers bash history expansion when not properly quoted. Single quotes prevent all shell interpretation.

## Claude Code Permissions

Trusted operations are configured in `.claude/settings.local.json`. Once approved, these operations run without prompting.

### Permission Format

```json
{
  "permissions": {
    "allow": [
      "Bash(command:*)",           // Bash command with wildcard
      "Bash(npm test:*)",          // Specific command prefix
      "mcp__server__tool",         // MCP tool
      "Skill(name)",               // Skill
      "WebFetch(domain:github.com)" // Web fetch for domain
    ]
  }
}
```

### Currently Trusted Operations

| Category | Examples |
|----------|----------|
| **Git** | `git init`, `git add`, `git commit`, `git push`, `git branch` |
| **GitHub CLI** | `gh issue *`, `gh pr *`, `gh api *`, `gh repo *` |
| **npm** | `npm install`, `npm run *`, `npm test` |
| **Veto MCP** | All veto tools (assess, start/end segment, wrap, capture, sql_query) |
| **Trello MCP** | All trello tools (boards, cards, lists, checklists, labels) |
| **Calendar MCP** | All gcal tools (list, find_free_time, create, update, delete) |

### Adding New Permissions

When Claude asks for approval, select "Always allow" to add to trusted operations. Or manually edit `.claude/settings.local.json`.

## Development

Work directly on main. Keep it simple. Add process after value is proven.
