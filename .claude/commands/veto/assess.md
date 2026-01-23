---
description: 'Log your current cognitive state (energy, focus, mood, sleep)'
---

# Veto Assess

Log your current cognitive and physiological state to build patterns over time.

## When to Use

| Use `/veto:assess` when... | Use `/veto:daily` instead when... |
|---------------------------|-----------------------------------|
| Mid-day state check-in | Starting your work day |
| State changed significantly (energy crash, second wind) | You want full planning with tasks + calendar |
| Quick state log without planning overhead | First assessment of the day |
| Building data for pattern recognition | You need task recommendations |

**Rule of thumb**: `/veto:daily` is the primary workflow. Use `/veto:assess` for standalone state updates between daily planning sessions.

## Steps

1. Ask the user for their current state:
   - **Energy** (1-10, required): How energetic do you feel?
   - **Focus** (1-10, required): How focused are you?
   - **Mood** (optional): Current emotional state (e.g., 'calm', 'anxious', 'motivated')
   - **Sleep hours** (optional): Hours of sleep last night

2. Call the `mcp__veto__veto_assess` tool with the provided values.

3. Present the Execution Profile results to the user:
   - Their logged state
   - Current circadian phase
   - Recommendation for deep or shallow work
   - Confidence level based on accumulated data

## Example Interaction

User runs `/veto-assess`

Ask: "How are you feeling? Please share:
- Energy level (1-10)
- Focus level (1-10)
- Mood (optional)
- Hours of sleep (optional)"

Then call the tool and report results.
