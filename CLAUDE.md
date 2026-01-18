# Claude Code Instructions

## Repository Structure

This is a mono-repo containing multiple projects. Each project lives in its own directory:

| Project | Directory | Description |
|---------|-----------|-------------|
| veto | `/veto` | Cognitive operating system - MCP server for state tracking and guardrails |

## GitHub Issue Workflow

When discovering bugs, enhancements, or backlog items during development, log them as GitHub issues using this format:

### Title Format
```
[project-name] Short descriptive title
```

Examples:
- `[veto] Allow manual duration entry when ending segments`
- `[veto] Add calendar integration for drift detection`

### Issue Template
```bash
gh issue create --title "[project] Title" --body "$(cat <<'EOF'
## Project
**project-name** (short description)

## Problem
Description of the issue or enhancement need.

## Proposed Solutions
1. Option 1
2. Option 2

## Recommendation
Which option and why.

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --label "enhancement"
```

### Labels
- `enhancement` - New features or improvements
- `bug` - Something broken
- `documentation` - Docs updates needed

### When to Create Issues
- Discovering limitations during usage (like segment duration reporting)
- Ideas that emerge from user sessions
- Technical debt identified during development
- Features deferred from current scope
