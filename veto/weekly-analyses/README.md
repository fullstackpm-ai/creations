# Weekly Analyses

This folder contains weekly pattern analyses generated from Veto data.

## Key Concepts

### Captures Are Outputs, Not Inputs

Captures serve as a **pressure release valve** during deep work. When intrusive thoughts arise (operational concerns, ideas, action items), capturing them externalizes the thought so you can return to focus without:
1. Getting pulled into Slack/email to act on the thought
2. Having the thought loop in your head and kill focus

**High capture volume is a symptom, not a cause.** A day with 23 captures means 23 intrusive thoughts were *contained* rather than acted upon. Without the capture system, those thoughts would have caused context switches or mental loops.

When analyzing capture data:
- Don't interpret high volume as "fragmentation caused by capturing"
- Do interpret high volume as "the capture system protected focus on a high-intrusion day"
- Track capture themes to understand what's generating cognitive load

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

Run `/veto:weekly` to pull the past 7 days of Veto data and initiate a conversational analysis session.

The skill:
1. Queries state_logs, segments, daily_summaries, and captures
2. Formats raw data for review
3. Surfaces last week's "Questions for Next Week" for follow-up
4. Initiates conversation for deeper analysis

**The human + Claude conversation produces the insights.** The value comes from contextual reasoning, not automation.

## Deep Analysis Resources

After surface-level analysis, cross-reference findings with two knowledge bases:

### 1. Personal Cognitive Profile

**`veto/knowledge/CognitiveProfile.md`** - Your cognitive patterns

This file describes *how you specifically think* - your mental models, tendencies, and cognitive architecture. Use these as a lens for interpreting weekly data:

| Pattern | Description |
|---------|-------------|
| Systems Thinking | Default mode is architect - you solve problem classes, not instances |
| Friction Intolerance | Visceral reaction to repetitive friction |
| Meta-Cognitive Awareness | You watch yourself think and flag reactions for analysis |
| Leadership Burden | People management runs as a background process |
| Visibility Anxiety | Lack of visibility = loss of control = anxiety |
| Self-First Accountability | Default attribution is self-blame |
| External Validation Seeking | Seeking confirmation for experiential insights |
| Architect vs Operator | Natural mode (designing) vs role requirement (operating) |

### 2. Human Behavior Engine

**`veto/knowledge/BehaviorInsights.md`** - General behavioral patterns

45+ patterns that reveal *why humans behave the way they do*:
- Pattern 27 (Divergent Optimization Functions) - identity fragmentation
- Pattern 40 (Self-Persuasion Dependency) - why known insights aren't followed
- Pattern 45 (Single-Modality Illusion) - thinking-by-externalizing
- And 42 more...

### Updating Cognitive Profile

If weekly analysis reveals a new pattern not in CognitiveProfile.md, add it with:
- Pattern name and description
- Evidence from captures/segments
- Implications for behavior
- Cross-references to BehaviorInsights.md if applicable

## Learning Loop

Each week should:
1. Answer questions from the previous week
2. Track whether recommendations were followed
3. Measure if following recommendations improved metrics
4. Generate new insights and recommendations

This creates a compounding feedback loop where the system learns which interventions actually work.
