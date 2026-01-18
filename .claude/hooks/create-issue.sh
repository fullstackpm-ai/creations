#!/bin/bash
# Auto-create GitHub issue from Claude Code
# Usage: echo '{"project":"veto","title":"Issue title","problem":"Description","solution":"Proposed fix","label":"enhancement"}' | .claude/hooks/create-issue.sh

set -e

# Read JSON from stdin
INPUT=$(cat)

# Parse fields
PROJECT=$(echo "$INPUT" | jq -r '.project // "general"')
TITLE=$(echo "$INPUT" | jq -r '.title')
PROBLEM=$(echo "$INPUT" | jq -r '.problem // "No description provided"')
SOLUTION=$(echo "$INPUT" | jq -r '.solution // "To be determined"')
LABEL=$(echo "$INPUT" | jq -r '.label // "enhancement"')

# Validate required fields
if [ -z "$TITLE" ] || [ "$TITLE" = "null" ]; then
  echo "Error: title is required" >&2
  exit 1
fi

# Create issue body
BODY=$(cat <<EOF
## Project
**${PROJECT}**

## Problem
${PROBLEM}

## Proposed Solution
${SOLUTION}

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)

# Create the issue
ISSUE_URL=$(gh issue create \
  --title "[${PROJECT}] ${TITLE}" \
  --body "$BODY" \
  --label "$LABEL" 2>&1)

echo "Created: $ISSUE_URL"
