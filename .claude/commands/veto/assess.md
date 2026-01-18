---
description: 'Log your current cognitive state (energy, focus, mood, sleep)'
---

# Veto Assess

Log your current cognitive and physiological state to build patterns over time.

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
