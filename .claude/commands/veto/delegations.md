---
description: 'Review and manage delegated tasks by person'
---

# Veto Delegations

Review delegated tasks, surface overdue items, and add new delegations.

**Board ID:** `696ee27d5be8fa4ad4d18486`

## Steps

### Step 1: Fetch All Delegations

1. Call `mcp__trello__trello_get_lists` with board_id `696ee27d5be8fa4ad4d18486`
2. For each list (except "Done"), call `mcp__trello__trello_get_cards` to get active delegations
3. Call `mcp__trello__trello_get_overdue_cards` with board_id to get overdue items

### Step 2: Present Dashboard

Display a formatted summary:

```
===============================================================
                    DELEGATIONS DASHBOARD
===============================================================

OVERDUE (needs follow-up)
   [Person] - [Task name] - Due: [date]
   [Person] - [Task name] - Due: [date]

---------------------------------------------------------------

BY PERSON

[Tim] (X active)
   - [Task name] | Due: [date] or "No due date"
   - [Task name] | Due: [date]

[Luke] (X active)
   - [Task name] | Due: [date]

... (repeat for each person with active items)

---------------------------------------------------------------

SUMMARY
   Total active: X across Y people
   Overdue: X items

===============================================================
```

- Only show people who have active delegations
- Sort overdue items by how overdue they are (most overdue first)
- If no overdue items, skip that section

### Step 3: Offer Actions

Use `AskUserQuestion` to offer next steps:
- **question**: "What would you like to do?"
- **header**: "Action"
- **options**:
  - **Add delegation** - "Delegate a new task to someone"
  - **Mark done** - "Complete a delegated task"
  - **Follow up** - "I'll reach out about overdue items"
  - **Done** - "Exit delegations view"

### Step 4: Handle Actions

**Add delegation:**
1. Ask which person (use AskUserQuestion with person names as options)
2. Ask for task description
3. Ask for due date (optional)
4. Call `mcp__trello__trello_create_card` with:
   - `list_id`: The person's list ID
   - `name`: Task description
   - `due`: Due date if provided
5. Confirm creation

**Mark done:**
1. Show numbered list of active delegations
2. Ask which one to mark done
3. Call `mcp__trello__trello_move_card` to move to Done list
4. Confirm completion

**Follow up:**
1. Acknowledge - user will handle externally
2. Optionally offer to update due dates on overdue items

## List ID Reference

| Person | List ID |
|--------|---------|
| Tim | 697470fbc0a26e07a48dbf9e |
| Luke | 697470fb95556d853010cabc |
| Jess | 697470fc826e36d19e71970e |
| Jordan | 697470fcbaef374e4a491e85 |
| Anne | 697470fd0605bf840f01d0e2 |
| Brian | 697470fd197d7f23402021e9 |
| Lori | 697470fd0b7e98868c6dd360 |
| Aary | 697470fe20b2062cb9d78ab5 |
| Fanishka | 697470fe8dfb28c3b62fb159 |
| Justin | 697470ff3d2f1b09f81e3611 |
| ALM | 697470ff73d1f5d91f2103ec |
| Done | 697470ffa211f99e94f87c46 |

## Integration with /veto:daily

In `/veto:daily`, after showing the main plan, add a brief delegations check:

```
---------------------------------------------------------------

DELEGATIONS CHECK
   Overdue: X items need follow-up
   Run /veto:delegations for details

---------------------------------------------------------------
```

Only show this section if there are overdue delegations.
