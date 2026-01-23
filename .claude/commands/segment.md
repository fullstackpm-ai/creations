---
description: 'Quick segment logging (simpler than /veto:start + /veto:end)'
---

# Quick Segment

Log a completed work segment with minimal friction. Use this when you forgot to start/end tracking or want to quickly log past work.

## Steps

1. Use `AskUserQuestion` to ask:
   - **What did you work on?** (description)
   - **How long?** (duration in minutes)
   - **Focus score?** (1-10)
   - **Deep or shallow work?** (deep/shallow)

2. Call `mcp__veto__veto_log_segment` with:
   - `intended_type`: deep or shallow
   - `start_time`: Calculate from "X minutes ago"
   - `duration_minutes`: User's answer
   - `focus_score`: User's answer
   - `description`: User's answer
   - `completed`: true (default)

3. Confirm the segment was logged:
   ```
   ✓ Logged: [description]
     Duration: X min | Focus: X/10 | Type: deep/shallow
   ```

## Example

User: `/segment`

Ask: "Quick segment log:
- What did you work on?
- How long (minutes)?
- Focus score (1-10)?
- Deep or shallow work?"

User: "Code review, 45 min, 7, deep"

→ Log segment and confirm.

## When to Use

| Use `/segment` | Use `/veto:start` + `/veto:end` |
|----------------|--------------------------------|
| Retroactive logging | Real-time tracking |
| Quick single entry | Want time-based duration |
| Forgot to track | Need Trello card linking |
