# Claude Code Instructions

## Repository Structure

This is a mono-repo containing multiple projects:

| Project | Directory | Description |
|---------|-----------|-------------|
| veto | `/veto` | Cognitive operating system - MCP server for state tracking and guardrails |

## GitHub Issues

When discovering bugs or enhancements during development, log them as issues:

```bash
echo '{"project":"veto","title":"Issue title","problem":"Description","solution":"Proposed fix","label":"enhancement"}' | .claude/hooks/create-issue.sh
```

**Labels:** `enhancement`, `bug`, `documentation`

## Development

Work directly on main. Keep it simple. Add process after value is proven.
