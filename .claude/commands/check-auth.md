---
description: 'Check and refresh authentication for all integrations'
---

# Check Auth

Verify authentication status for all integrated services and provide refresh instructions if needed.

## Steps

1. **Test each integration** (run in parallel):

   **Trello**:
   - Call `mcp__trello__trello_list_boards`
   - Success = auth working
   - Failure = needs token refresh

   **Google Calendar**:
   - Call `mcp__google-calendar__gcal_list_events` with `range: "today"`
   - Success = auth working
   - Failure = needs re-auth

   **Veto/Supabase**:
   - Call `mcp__veto__veto_sql_query` with `query: "SELECT 1"`
   - Success = auth working
   - Failure = check env vars

2. **Report status**:

```
AUTHENTICATION STATUS
═══════════════════════════════════════════════════

Service            Status      Expires/Notes
───────────────────────────────────────────────────
Trello             ✓ Valid     Token never expires
Google Calendar    ✓ Valid     Auto-refreshes
Veto (Supabase)    ✓ Valid     Service role key
───────────────────────────────────────────────────
```

3. **If any service fails**, provide fix instructions:

```
⚠ Google Calendar auth expired

To fix:
  cd /Users/akshay/Documents/FullStackPM_AI/creations/google-calendar-mcp
  npm run auth

Then restart Claude Code to reload the MCP server.
```

## Auth Refresh Commands

| Service | Refresh Command |
|---------|-----------------|
| Trello | Update token in `.env` (get from trello.com/app-key) |
| Google Calendar | `cd google-calendar-mcp && npm run auth` |
| Veto | Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in veto/.env |
