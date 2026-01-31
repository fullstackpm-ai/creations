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
2. Surfaces previous week's insights and questions
3. Guides conversational analysis from surface → deeper insights
4. Organizes outputs across four vectors (system improvements, personal threads, cognitive profile, documentation)

**Core principle:** Surface insights show metrics. Deeper insights reveal truth. The goal is to find *threads to pull*, not just patterns to observe.

---

**EXECUTE THIS WORKFLOW IMMEDIATELY. Do not describe what you will do - actually do it.**

## Step 1: Get Week Info and Previous Analysis

1. Run `date +%Y-W%V` to get current week number (e.g., 2026-W05)
2. Check if previous week's analysis exists:
   - Read file: `veto/weekly-analyses/[PREV-WEEK].md`
   - Extract **Key Insights** and **Questions for Next Week** sections
3. Read current Cognitive Profile: `veto/knowledge/CognitiveProfile.md`
   - Note current patterns (for cross-referencing later)

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
   [Key insights from previous week]
   [Questions that were posed for this week]

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

## Step 4: Surface-Level Analysis

After presenting raw data, provide **surface-level insights backed by metrics**. Compare to previous week's *insights*, not just numbers.

Focus on:
1. **Pattern evolution** - How did last week's insights show up this week? Did they persist, evolve, or resolve?
2. **Metric correlations** - Sleep/focus thresholds, completion patterns, energy trajectories
3. **Capture themes** - What's generating cognitive load this week vs last?

**Important framing:**
- DO NOT judge weeks as "failed" based on declining metrics
- Behavior change takes time: Discovery → Acknowledgment → Internalization → Gradual adoption
- A week with declining metrics but increased self-awareness is progress, not regression
- Surface insights show what happened; they don't reveal *why* or *what it means*

Present surface analysis, then prompt:

```
═══════════════════════════════════════════════════════════════
                    SURFACE ANALYSIS COMPLETE
═══════════════════════════════════════════════════════════════

The above shows what the metrics reveal. But surface insights
don't reveal the deeper truth.

Ready to dig deeper? I'll look for:
• Anomalies that don't fit the pattern (the 2/10 focus score, the divergent data point)
• Unprocessed captures (questions you asked but didn't answer)
• Patterns connecting to your Cognitive Profile
• Threads worth pulling on

What aspects would you like to explore deeper?
═══════════════════════════════════════════════════════════════
```

## Step 5: Deeper Insight Mining

This is where the real value emerges. Based on user direction, dig for insights that reveal truth.

### What to Look For

**1. Anomalies and Outliers**
- The segment with unusually low/high focus - what was different about it?
- Days where energy and focus diverged - what caused the split?
- The capture that doesn't fit the theme - what's it pointing to?

**2. Unprocessed Data**
- Captures phrased as questions ("Why do I...?", "Need to understand...")
- Body sensations mentioned but not explored
- Patterns named but not investigated

**3. Task-Specific Patterns**
- Which *types* of tasks consistently drain vs energize?
- Are there tasks that produce worse outcomes regardless of state?
- What distinguishes completed vs incomplete segments beyond focus score?

**4. Cognitive Profile Cross-Reference**
Read `veto/knowledge/CognitiveProfile.md` and ask:
- How did known patterns show up this week?
- Did any pattern manifest in a new way?
- Is there a new pattern not yet documented?

**5. Behavioral Pattern Cross-Reference**
If relevant, cross-reference with `veto/knowledge/BehaviorInsights.md`:
- What hidden truths does the data reveal through behavioral lenses?
- Are there patterns the user can't see because they're inside them?

### How to Present Deeper Insights

Each deeper insight should have:
1. **What the data shows** - The specific evidence
2. **What this reveals** - The underlying truth or pattern
3. **Status** - Is this processed, partially processed, or unprocessed?
4. **Thread to pull** - If unprocessed, what question should be explored?

Example format:
```
### Insight: [Title]

**What the data shows:**
[Specific evidence from this week's data]

**What this reveals:**
[The underlying truth - why this matters]

**Status:** [Processed / Partially processed / Unprocessed]

**Thread to pull:** [Question for deeper exploration, if applicable]
```

## Step 6: Organize Outputs Across Four Vectors

After deeper analysis, organize findings into four categories:

### Vector 1: System Improvements (GitHub Issues)
Insights that point to Veto design improvements:
- Missing data the system should capture
- Signals the system should surface
- Guardrails that should be added
- UX friction that should be removed

**Action:** Create GitHub issues for each improvement in `fullstackpm-ai/creations`

### Vector 2: Personal Threads to Process (Trello Card)
Insights that require personal inquiry - sitting with questions, not solving them quickly:
- Unprocessed emotions or body sensations
- Questions about identity, values, or meaning
- Patterns that need reflection, not action

**Action:** Create a single Trello card "Deep Threads to Process (W[XX])" on Thinking board with checklist items for each thread

**Approach note:** These require Pattern 1a work (feel before framework). Pick one thread per week. Sit with it. Don't rush to systematize.

### Vector 3: Cognitive Profile Updates
New patterns discovered that should be documented:
- Patterns that showed up consistently in this week's data
- New manifestations of existing patterns
- Patterns that connect multiple observations

**Action:** Update `veto/knowledge/CognitiveProfile.md` with new patterns

### Vector 4: Weekly Analysis Documentation
The analysis itself, prioritizing deeper insights over surface metrics:
- Deeper insights should be the primary content
- Surface metrics preserved in Raw Metrics section for reference
- Artifacts section linking to all created items
- Questions for next week

**Action:** Save to `veto/weekly-analyses/[YYYY-WNN].md`

## Step 7: Save and Summarize

After organizing across all vectors:

1. **Save the weekly analysis file** with this structure:
   ```
   # Weekly Analysis: [YYYY-WNN]
   **Period:** [Start Date] - [End Date]

   ## Deeper Insights
   [The insights that reveal truth - 5-10 insights]

   ## Artifacts Created
   [Table of GitHub issues, Trello cards, Cognitive Profile updates]

   ## Week [N-1] → Week [N]: Pattern Evolution
   [How previous week's insights evolved or persisted]

   ## Captures by Theme
   [Grouped captures for reference]

   ## Questions for Next Week
   [Specific questions to investigate]

   ## Raw Metrics
   [State logs, segments, summaries tables for reference]
   ```

2. **Summarize what was created:**
   ```
   ═══════════════════════════════════════════════════════════════
                        WEEKLY ANALYSIS COMPLETE
   ═══════════════════════════════════════════════════════════════

   Created:
   • [N] GitHub issues for Veto improvements
   • Trello card with [N] threads to process
   • [N] new patterns added to Cognitive Profile
   • Weekly analysis saved to veto/weekly-analyses/[WEEK].md

   Key insight this week:
   [Single most important deeper insight]

   Thread to prioritize:
   [The one personal thread most worth sitting with]
   ═══════════════════════════════════════════════════════════════
   ```

## Step 8: Deeper Reflection Check (Optional)

Weekly analysis surfaces operational patterns. Some insights point to deeper questions about role, identity, and life architecture.

### Check for Existential Themes

Review the week's captures and insights for themes beyond "how do I work better":

- **Role fit questions** - Am I in the right seat?
- **Identity tensions** - Conflict between who I am and what the role requires
- **Energy patterns** - Consistent drain from certain work categories
- **Resentment signals** - "I shouldn't have to do this" feelings

### If Existential Themes Emerge

1. **Check `veto/knowledge/RoleReflection.md`** for existing reflection work
2. **Surface the theme** to the user
3. **If exploring**, either:
   - Continue in this session
   - Create a Trello card for dedicated reflection
   - Schedule for next week

### Quarterly Deep Reflection (Every 12-13 weeks)

At quarter boundaries, prompt:
```
It's been ~12 weeks since last deep reflection.

Beyond operational patterns:
1. Role fit - Is COO still the right seat?
2. Energy trajectory - More or less energized than 12 weeks ago?
3. Life architecture - Is work structured the way you want?

Want to do deeper reflection, or stay operational today?
```

---

## Core Principles

1. **Surface insights show metrics. Deeper insights reveal truth.** Always dig past the numbers.

2. **Behavior change takes time.** The path is: Discovery → Acknowledgment → Internalization → Gradual adoption. Don't judge weeks as "failed" based on metrics.

3. **Compare insights, not just numbers.** When looking at previous week, ask how insights evolved, not just whether numbers improved.

4. **Look for unprocessed data.** Questions in captures, body sensations, patterns named but not explored - these are threads to pull.

5. **Organize across four vectors.** System improvements (GitHub), personal threads (Trello), cognitive profile updates, and documentation each serve different purposes.

6. **The value comes from conversation.** The skill provides structure; the insight emerges from collaborative exploration with the user.

---

## Notes

- Cross-reference with knowledge bases:
  - `veto/knowledge/CognitiveProfile.md` - Personal cognitive patterns
  - `veto/knowledge/BehaviorInsights.md` - General human behavior patterns
  - `veto/knowledge/RoleReflection.md` - Role fit and career architecture
- Previous week's questions should drive follow-up analysis
- Captures are outputs (pressure release), not inputs - high volume = contained intrusions
- Weekly analyses stored in `veto/weekly-analyses/`
- If new cognitive patterns emerge, update CognitiveProfile.md
- Quarterly: prompt for deeper life/role reflection beyond operational patterns
