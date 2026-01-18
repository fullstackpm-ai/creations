---
description: 'Check if deep work is recommended based on your current state'
---

# Veto Plan

Generate a daily plan with guardrail logic. Check if deep work is recommended based on your current state and historical patterns.

## Steps

1. Ask the user what type of work they're planning:
   - **Deep work**: Cognitively demanding tasks requiring sustained focus
   - **Shallow work**: Administrative tasks, emails, routine work

2. Call the `mcp__veto__veto_plan` tool with their intended work type.

3. Present the results:
   - Current state assessment
   - Recommendation (deep or shallow)
   - Guardrail status (if confidence >= 70%, system may refuse deep work)
   - Evidence for the recommendation

4. If guardrail refuses deep work, explain options:
   - Override (proceed anyway)
   - Defer (postpone to better time)
   - Switch to shallow work

## Example Interaction

User runs `/veto-plan`

Ask: "What type of work are you planning? (deep/shallow)"

Then call the tool and report the recommendation with any guardrail warnings.
