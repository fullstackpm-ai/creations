---
description: 'Cross-system health check for all integrations'
---

# Sync Status

Quick health check for all integrated systems.

## Steps

Run these checks in parallel:

1. **Trello** - `mcp__trello__trello_list_boards`
2. **Google Calendar** - `mcp__google-calendar__gcal_list_events` with `range: "today"`
3. **Veto/Supabase** - `mcp__veto__veto_sql_query` with `query: "SELECT 1 as health_check"`

## Report Format

```
INTEGRATION STATUS
────────────────────────────────────────
System              Status    Details
────────────────────────────────────────
Trello              ✓ / ✗     X boards found
Google Calendar     ✓ / ✗     X events today
Veto (Supabase)     ✓ / ✗     Connected / Error
────────────────────────────────────────

All systems operational. / X system(s) need attention.
```

## Error Handling

If any system fails:
- Show the error message
- Suggest troubleshooting steps (e.g., "Run `npm run auth` in google-calendar-mcp")
