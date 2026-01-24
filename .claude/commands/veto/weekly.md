---
description: 'Weekly pattern analysis and behavioral insights from Veto data'
---

# Veto Weekly Analysis

## When to Use

**`/veto:weekly` is for end-of-week reflection.** Use it:

- At the **end of your work week** (Friday/Saturday)
- When you want to **understand patterns** in your data
- To **surface hidden truths** that daily tracking can't reveal

**What it does:**
1. Pulls past 7 days of Veto data (state logs, segments, summaries, captures)
2. Surfaces previous week's "Questions for Next Week"
3. Formats raw data for review
4. Initiates conversational analysis for deeper insights

**The human + Claude conversation produces the insights.** The value comes from contextual reasoning, not automation.

---

**EXECUTE THIS WORKFLOW IMMEDIATELY. Do not describe what you will do - actually do it.**

## Step 1: Get Week Info and Previous Analysis

1. Run `date +%Y-W%V` to get current week number (e.g., 2026-W04)
2. Calculate previous week number
3. Check if previous week's analysis exists:
   - Read file: `veto/weekly-analyses/[PREV-WEEK].md`
   - Extract "Questions for Next Week" section if it exists

## Step 2: Query Veto Data (run in parallel)

Call these SQL queries simultaneously using `mcp__veto__veto_sql_query`:

**State Logs:**
```sql
SELECT date, energy, focus, mood, sleep_hours, circadian_phase, created_at
FROM state_logs
WHERE date >= current_date - interval '7 days'
ORDER BY created_at
```

**Segments:**
```sql
SELECT intended_type, description, start_time, end_time, focus_score, completed,
       EXTRACT(EPOCH FROM (end_time - start_time))/60 as duration_minutes
FROM segments
WHERE start_time >= current_date - interval '7 days'
ORDER BY start_time
```

**Daily Summaries:**
```sql
SELECT date, completion_ratio, mean_focus, deep_work_minutes, shallow_work_minutes, notable_events
FROM daily_summaries
WHERE date >= current_date - interval '7 days'
ORDER BY date
```

**Captures:**
```sql
SELECT capture_type, content, urgency, status, routed_to, created_at
FROM captures
WHERE created_at >= current_date - interval '7 days'
ORDER BY created_at
```

## Step 3: Present Raw Data

Format and present the data:

```
═══════════════════════════════════════════════════════════════
                    VETO WEEKLY DATA
                 Week [N]: [Start Date] - [End Date]
═══════════════════════════════════════════════════════════════

📋 FOLLOW-UP FROM LAST WEEK
   [Questions from previous week's analysis, or "First week - no prior data"]

───────────────────────────────────────────────────────────────

📊 STATE LOGS ([N] entries)

   | Date  | Energy | Focus | Sleep | Phase         | Mood      |
   |-------|--------|-------|-------|---------------|-----------|
   [table of state logs]

───────────────────────────────────────────────────────────────

📈 SEGMENTS ([N] segments, [X]h deep, [Y]h shallow)

   | Date  | Type    | Description                    | Duration | Focus | Done |
   |-------|---------|--------------------------------|----------|-------|------|
   [table of segments, sorted by start time]

───────────────────────────────────────────────────────────────

📅 DAILY SUMMARIES

   | Date  | Completion | Avg Focus | Deep   | Shallow | Notable Events        |
   |-------|------------|-----------|--------|---------|----------------------|
   [table of daily summaries]

───────────────────────────────────────────────────────────────

💭 CAPTURES ([N] total: [X] ideas, [Y] actions)

   **Themes detected:** [list common themes from capture content]

   [List captures grouped by theme or date]

═══════════════════════════════════════════════════════════════
```

## Step 4: Prompt for Analysis

After presenting the data, prompt the user:

```
═══════════════════════════════════════════════════════════════
                    READY FOR ANALYSIS
═══════════════════════════════════════════════════════════════

The raw data is above. Let's analyze patterns together.

**Surface-level analysis I can do:**
1. Sleep + focus correlations (threshold effects, weekday vs weekend)
2. Work type distribution (categorize segments)
3. Completion rate patterns (what made good days good?)
4. Capture theme analysis (what's generating cognitive load?)

**Deep analysis (cross-reference with BehaviorInsights.md):**
After surface analysis, I can map findings against the Human Behavior
Engine patterns to surface hidden truths about *why* the data looks
this way.

What would you like to explore first?
═══════════════════════════════════════════════════════════════
```

## Step 5: Conduct Analysis (Conversational)

Based on user's response, conduct analysis:

### Surface-Level Analysis Options

**Sleep + Focus:**
- Calculate avg energy/focus at different sleep levels
- Compare weekday vs weekend performance at same sleep
- Identify threshold effects (e.g., <6h = degradation)
- Validate circadian patterns

**Work Type Distribution:**
- Categorize segments by description keywords:
  - Strategic Planning: "planning", "strategy", "org chart", "architecture", "review"
  - Technical/Tool Dev: "MCP", "veto", "setup", "build", "implement", "code"
  - People Management: "1:1", "performance", "feedback", "team"
  - Meeting Prep: "prep", "meeting", specific meeting names
  - Research/Analysis: "research", "analysis", "investigate", "understand"
- Calculate hours and % per category

**Completion Patterns:**
- Compare completion rate to hours worked
- Identify what good days had in common
- Look for diminishing returns signals

**Capture Themes:**
- Group captures by content similarity
- Identify cognitive load sources
- Note: high volume = high intrusion day (captures protected focus)

### Deep Analysis

After surface analysis, read `veto/knowledge/BehaviorInsights.md` and cross-reference findings with behavioral patterns:

- Pattern 3: Ego Preservation Loop
- Pattern 19: The Consistency Trap
- Pattern 27: Divergent Optimization Functions
- Pattern 40: Self-Persuasion Dependency
- Pattern 45: Single-Modality Illusion
- And others as relevant...

Surface hidden truths that raw metrics can't show.

## Step 6: Generate Recommendations

Based on analysis, generate:

1. **One primary recommendation** - the single highest-leverage change
2. **2-3 supporting recommendations** - additional improvements
3. **Questions for next week** - what to track/verify

## Step 7: Save Analysis

After the conversation is complete, ask the user if they want to save the analysis.

If yes:
1. Get current week number: `date +%Y-W%V`
2. Create file at `veto/weekly-analyses/[YYYY-WNN].md`
3. Include all sections:
   - Sleep + Focus Patterns
   - Work Type Distribution
   - Daily Performance Summary
   - Underlying Truths
   - Capture Analysis
   - Deep Analysis (if done)
   - Behavioral Recommendations
   - Questions for Next Week
   - Raw Metrics Summary

Confirm: "Analysis saved to `veto/weekly-analyses/[YYYY-WNN].md`"

## Notes

- The value comes from conversation, not automation
- Always cross-reference with BehaviorInsights.md for deeper insights
- Previous week's questions should drive follow-up analysis
- Captures are outputs (pressure release), not inputs - high volume = contained intrusions
- Weekly analyses are stored as markdown, not in database
