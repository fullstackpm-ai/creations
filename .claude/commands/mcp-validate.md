---
description: 'Validate MCP tool schemas and documentation'
---

# MCP Validate

Check that all MCP tools have proper Zod schemas, descriptions, and error handling.

## Steps

1. For each MCP server, read the main index.ts file:
   - `/veto/src/index.ts`
   - `/trello-mcp/src/index.ts`
   - `/google-calendar-mcp/src/index.ts`

2. For each tool definition, verify:
   - **Schema**: Has Zod schema with proper types
   - **Description**: Has clear, non-empty description
   - **Required fields**: All required params marked as required
   - **Error handling**: Tool implementation has try/catch

3. Report findings:

```
MCP TOOL VALIDATION
═══════════════════════════════════════════════════

veto (X tools)
───────────────────────────────────────────────────
✓ veto_assess - schema ok, description ok
✓ veto_start_segment - schema ok, description ok
⚠ veto_xxx - missing description for param Y

trello-mcp (X tools)
───────────────────────────────────────────────────
✓ trello_list_boards - schema ok, description ok
...

google-calendar-mcp (X tools)
───────────────────────────────────────────────────
✓ gcal_list_events - schema ok, description ok
...

═══════════════════════════════════════════════════
Summary: X tools validated, Y warnings, Z errors
═══════════════════════════════════════════════════
```

## Validation Rules

| Check | Pass | Warn | Fail |
|-------|------|------|------|
| Zod schema exists | Has schema | - | No schema |
| Tool description | > 20 chars | < 20 chars | Empty |
| Param descriptions | All params described | Some missing | None |
| Error handling | try/catch in impl | - | No error handling |
