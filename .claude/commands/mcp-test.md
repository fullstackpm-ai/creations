---
description: 'Quick test runner for MCP servers in this mono-repo'
---

# MCP Test

Run build and tests for MCP servers in this mono-repo.

## Steps

1. Run `date` to get current time

2. Run these in parallel for each MCP project:

   **Veto** (`/veto`):
   ```bash
   cd /Users/akshay/Documents/FullStackPM_AI/creations/veto && npm run build
   ```

   **Trello MCP** (`/trello-mcp`):
   ```bash
   cd /Users/akshay/Documents/FullStackPM_AI/creations/trello-mcp && npm run build
   ```

   **Google Calendar MCP** (`/google-calendar-mcp`):
   ```bash
   cd /Users/akshay/Documents/FullStackPM_AI/creations/google-calendar-mcp && npm run build
   ```

3. Report results in a summary table:

```
MCP BUILD STATUS
────────────────────────────────
Project              Status
────────────────────────────────
veto                 ✓ / ✗
trello-mcp           ✓ / ✗
google-calendar-mcp  ✓ / ✗
────────────────────────────────
```

4. If any build failed, show the error with file:line references.

## Notes

- This is a quick validation that all MCP servers compile
- For full testing, run project-specific test commands
