---
description: 'Document a work meeting from transcript'
---

# Veto Meeting Documentation

Process a meeting transcript into structured notes with action items.

## When to Use

After any work meeting where you have a transcript or raw notes:
- 1:1s with direct reports or manager
- Team syncs and standups
- Interviews (conducting or being interviewed)
- Reviews (performance, design, architecture)
- External meetings (clients, partners, vendors)

## Steps

### 1. Gather Meeting Context

Ask the user:
- **Meeting type**: 1:1, team, interview, external, or other
- **Attendee(s)**: Who was in the meeting (for 1:1s, just the other person's name)
- **Date**: When the meeting occurred (default: today)
- **Transcript**: The raw meeting transcript or notes

Use `AskUserQuestion`:
- **question**: "What type of meeting is this?"
- **header**: "Type"
- **options**:
  - **1:1** - "One-on-one with a specific person"
  - **Team** - "Team sync, standup, or group meeting"
  - **Interview** - "Job interview (either direction)"
  - **External** - "Client, partner, or vendor meeting"

### 2. Process the Transcript

From the raw transcript, extract:

**Summary** (2-4 bullet points):
- Key topics discussed
- Important context or background mentioned

**Decisions Made**:
- Any commitments or agreements reached

**Action Items** (critical):
- Format: `- [ ] @owner: task description`
- Distinguish between `@me` (user) and `@[name]` (other person)
- Include deadlines if mentioned

**Follow-up Questions**:
- Open questions that need answers
- Topics to revisit next time

**Reflections** (for 1:1s especially):
- Patterns noticed in the conversation
- Leadership/communication observations
- Growth opportunities identified

### 3. Present for Review

Show the extracted summary to the user:

```
═══════════════════════════════════════════════════════════════
                    MEETING SUMMARY
        [Type]: [Attendee(s)] - [Date]
═══════════════════════════════════════════════════════════════

## Summary
• [bullet 1]
• [bullet 2]

## Decisions
• [decision 1]

## Action Items
- [ ] @me: [task]
- [ ] @[name]: [task]

## Follow-up
• [question or topic for next time]

## Reflections
• [pattern or observation]

═══════════════════════════════════════════════════════════════
```

Ask: "Does this capture the meeting accurately? Any edits needed?"

### 4. Save Meeting Notes

Determine the file path based on meeting type:

| Type | Path |
|------|------|
| 1:1 | `docs/meetings/1-1s/[name-lowercase]/YYYY-MM-DD.md` |
| Team (recurring) | `docs/meetings/team/[meeting-slug]/YYYY-MM-DD.md` |
| Team (one-off) | `docs/meetings/team/ad-hoc/YYYY-MM-DD-[topic-slug].md` |
| Interview | `docs/meetings/interviews/YYYY-MM-DD-[candidate-or-role].md` |
| External | `docs/meetings/external/YYYY-MM-DD-[company-or-topic].md` |

**Known recurring team meetings:**
- `weekly-product-meeting` - Weekly product team sync
- `ai-project-sync` - AI/LLM project sync

For team meetings, determine if it's a recurring meeting (use existing folder) or one-off (use ad-hoc).

Create parent directories if they don't exist using Bash `mkdir -p`.

Write the meeting notes file with this template:

```markdown
# [Attendee(s)] - [Full Date]

## Context
[Any pre-meeting context if provided, or "Recurring 1:1" / "Weekly sync" etc.]

## Summary
- [bullet 1]
- [bullet 2]

## Decisions
- [decision 1]

## Action Items
- [ ] @me: [task]
- [ ] @[name]: [task]

## Follow-up
- [question or topic]

## Reflections
- [observation]

---
*Documented: [timestamp]*
```

### 5. Store Raw Transcript (Optional)

Save the raw transcript for future PKB integration:

Path: `docs/meetings/.raw/YYYY-MM-DD-[type]-[name-or-topic].txt`

This preserves the full context for future semantic search capabilities.

### 6. Route Action Items to Trello

Use `AskUserQuestion`:
- **question**: "Create Trello cards for your action items?"
- **header**: "Actions"
- **options**:
  - **Yes** - "Add action items to Thinking board"
  - **No** - "Skip Trello integration"

If yes:
1. Get lists from Thinking board (`68031b17e0ef40f25b75d2ab`)
2. For each `@me` action item:
   - Create a card with the action as the title
   - Add description: `From [meeting type] with [attendee] on [date]`
   - Optionally set due date if mentioned in transcript
3. Confirm cards created

For `@[name]` action items (delegated to others):
- Offer to create cards on Delegated board (`696ee27d5be8fa4ad4d18486`)
- Include the person's name in the card

### 7. Confirm Completion

```
Meeting documented: docs/meetings/[path]
Action items: X created in Trello
Raw transcript saved: docs/meetings/.raw/[path]

Tip: These notes will surface in /veto:daily when you have
another meeting with [attendee].
```

## Notes

- For recurring 1:1s, notes accumulate in the same person's folder
- `/veto:daily` will check for recent notes when that person appears on today's calendar
- Action items use checkbox format for easy tracking in markdown
- The `.raw/` folder is gitignored by default for privacy; remove from .gitignore if you want to commit transcripts
