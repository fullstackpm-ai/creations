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

### Quick Issue Creation (Hook Script)

For faster issue creation, use the helper script:

```bash
echo '{"project":"veto","title":"Issue title","problem":"Description of the problem","solution":"Proposed solution","label":"enhancement"}' | .claude/hooks/create-issue.sh
```

**Fields:**
- `project` (required): Project name (e.g., "veto")
- `title` (required): Short descriptive title
- `problem` (required): Description of the issue
- `solution` (optional): Proposed fix or enhancement
- `label` (optional): "enhancement", "bug", or "documentation" (default: "enhancement")

## Autonomous PR Pipeline

This repo has a fully autonomous code review and fix loop:

```
Issue Created
    ↓
[Claude Code] → implements, creates PR
    ↓
[PR-Agent] → reviews, requests changes
    ↓
[Claude Code Action] → reads comments, applies fixes, pushes
    ↓
[PR-Agent] → re-reviews
    ↓
(loop max 3 iterations)
    ↓
[PR-Agent] → approves
    ↓
[Auto-merge] → squash merges (if "auto-merge" label present)
```

### Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `pr-agent.yml` | PR opened/updated | Reviews code, suggests improvements |
| `claude-fix-pr.yml` | PR-Agent requests changes | Analyzes feedback, applies fixes, pushes |
| `auto-merge.yml` | PR-Agent approves | Auto-merges if "auto-merge" label present |

### Manual Triggers

- `/claude-fix` - Comment on PR to trigger Claude to address feedback
- `/review` - Request PR-Agent review
- `/improve` - Get improvement suggestions
- `/ask <question>` - Ask PR-Agent about the PR

### Safety Controls

| Control | Setting |
|---------|---------|
| Max fix iterations | 3 (prevents infinite loops) |
| Auto-merge | Requires "auto-merge" label |
| Human override | Always possible via manual merge/close |

### Labels

- `auto-merge` - Enable auto-merge after PR-Agent approval
- `enhancement` - New features
- `bug` - Bug fixes
- `documentation` - Docs updates

## Hooks Configured

| Hook | Trigger | Action |
|------|---------|--------|
| PostToolUse (Bash) | `gh pr create` detected | Notifies that PR-Agent will review |

## Setup Requirements

Add these secrets to GitHub repo settings (Settings → Secrets → Actions):

- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude (required for PR-Agent and Claude Fix)

### Enable Auto-merge in Repo Settings

1. Go to Settings → General → Pull Requests
2. Check "Allow auto-merge"
3. Check "Automatically delete head branches" (optional)
