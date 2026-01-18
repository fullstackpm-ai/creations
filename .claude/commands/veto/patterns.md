---
description: 'Query historical patterns and insights from your work data'
---

# Veto Query Patterns

Query the Learning DB for insights and patterns about your historical performance.

## Steps

1. Ask the user what type of pattern they want to explore:
   - **deep_work_outcomes**: How did deep work go in similar states?
   - **state_correlation**: Which states correlate with good/poor outcomes?
   - **override_accuracy**: How often do overrides lead to regret?
   - **confidence_factors**: What's driving the current confidence level?

2. Optionally gather filters:
   - **Energy range** (min-max, 1-10)
   - **Focus range** (min-max, 1-10)
   - **Circadian phase** (morning_peak, midday, afternoon_dip, evening, night)
   - **Days back** (1-90, default 14)

3. Call the `mcp__veto__veto_query_patterns` tool with the parameters.

4. Present the insights in a clear, actionable format.

## Example Interaction

User runs `/veto-patterns`

Ask: "What patterns would you like to explore?
1. **deep_work_outcomes** - How does deep work perform in different states?
2. **state_correlation** - What conditions lead to good/poor outcomes?
3. **override_accuracy** - Are your overrides usually good decisions?
4. **confidence_factors** - Why is the system confident/uncertain?

Optional: Filter by energy range, focus range, time of day, or date range?"

Then query and present insights.
