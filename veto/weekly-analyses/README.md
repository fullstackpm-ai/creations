# Weekly Analyses

This folder contains weekly pattern analyses generated from Veto data.

## Naming Convention

Files use ISO week date format: `YYYY-WNN.md`

- `YYYY` = Year
- `W` = Literal "W" for week
- `NN` = Week number (01-52)

**Examples:**
- `2026-W04.md` = Week 4 of 2026 (Jan 17-24)
- `2026-W05.md` = Week 5 of 2026 (Jan 25-31)

## File Structure

Each weekly analysis contains:

1. **Sleep + Focus Patterns** - Correlations and thresholds
2. **Work Type Distribution** - Categorized time allocation
3. **Daily Performance Summary** - Completion rates and focus scores
4. **Underlying Truths** - Data-backed behavioral insights
5. **Capture Analysis** - Themes and cognitive streams
6. **Behavioral Recommendations** - Actionable changes
7. **Comparison to Previous Week** - Trend tracking
8. **Questions for Next Week** - Accountability loop
9. **Raw Metrics Summary** - Key numbers at a glance

## Usage

Run `/veto:weekly` (when implemented) to generate the next week's analysis.

Manual generation: Query Veto database for the past 7 days and analyze patterns across state_logs, segments, daily_summaries, and captures.

## Learning Loop

Each week should:
1. Answer questions from the previous week
2. Track whether recommendations were followed
3. Measure if following recommendations improved metrics
4. Generate new insights and recommendations

This creates a compounding feedback loop where the system learns which interventions actually work.
