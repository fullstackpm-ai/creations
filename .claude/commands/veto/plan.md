---
description: 'Check if deep work is recommended based on your current state'
---

# Veto Plan

Generate a daily plan with guardrail logic. Check if deep work is recommended based on your current state and historical patterns.

## Steps

1. Ask the user what type of work they're planning:
   - **Deep work**: Cognitively demanding tasks requiring sustained focus
   - **Structured tasks**: Administrative tasks, emails, routine work (stored as "shallow" internally)

2. Call the `mcp__veto__veto_plan` tool with their intended work type (use "shallow" for structured tasks).

3. Present the results:
   - Current state assessment
   - Recommendation (DEEP WORK or STRUCTURED TASKS)
   - Guardrail status (if confidence >= 70%, system may refuse deep work)
   - Evidence for the recommendation

   **If recommending STRUCTURED TASKS**, include:
   ```
   Good time for:
   • Email triage (batch, don't browse)
   • Meeting prep
   • Delegation follow-ups
   • Process documentation

   ⚠️ Structured ≠ unfocused
   Pick ONE task. Avoid reactive browsing.
   ```

4. If guardrail refuses deep work, explain options:
   - Override (proceed anyway)
   - Defer (postpone to better time)
   - Switch to structured tasks

## Example Interaction

User runs `/veto:plan`

Ask: "What type of work are you planning?
- **Deep work**: Requires sustained focus
- **Structured tasks**: Admin, email, prep work"

Then call the tool and report the recommendation with any guardrail warnings.

If recommending structured tasks, always include the task suggestions and "pick ONE" guardrail reminder.
