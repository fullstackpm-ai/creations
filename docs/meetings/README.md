# Meeting Notes

Work meeting documentation for Veto integration.

## Structure

```
meetings/
├── 1-1s/                    # One-on-one meetings by person
│   ├── tim/
│   │   └── 2026-01-29.md
│   └── aary/
│       └── 2026-01-29.md
├── team/                    # Team syncs, standups
│   ├── weekly-product-meeting/   # Recurring: Weekly product team sync
│   ├── ai-project-sync/          # Recurring: AI/LLM project sync
│   └── ad-hoc/                   # One-off team meetings
├── interviews/              # Job interviews
├── external/                # Client, partner, vendor meetings
└── .raw/                    # Raw transcripts (not committed)
```

## Usage

Use `/veto:meeting` to document meetings:
1. Paste raw transcript
2. Claude extracts summary, action items, reflections
3. Routes action items to Trello
4. Saves structured notes to appropriate folder

## Integration

- `/veto:daily` surfaces recent notes for today's 1:1s
- Action items sync to Trello boards
- Raw transcripts preserved for future PKB integration
