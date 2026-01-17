---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - veto/knowledge/HumanOperatingSystem.md
  - veto/knowledge/orchestratorInstructions.md
  - veto/knowledge/founderStateManagement.md
  - veto/knowledge/taskManagementPro.md
  - veto/knowledge/outcomeArchitect.md
  - veto/knowledge/thinkingEngine.md
  - veto/knowledge/emotionalGuardrail.md
date: 2026-01-16
author: fullStackPm
project_name: veto
---

# Product Brief: Veto

## Executive Summary

Veto is a living operating system that observes your state, protects decision quality, and continuously learns how you think, work, and live so that your actions stay aligned with what actually matters over time.

Unlike productivity tools built for the masses, Veto treats the human as a dynamic system requiring observability, not a user requiring motivation. It integrates physiology, cognition, emotion, and strategy into a unified architecture that adapts to the individual over time.

The system exists because subjective experience is no longer a reliable control surface for high-stakes, high-complexity lives. Veto provides the instrumentation and adaptive reasoning necessary to operate with clarity when intuition alone is insufficient.

---

## Core Vision

### Problem Statement

High-agency individuals operating at significant complexity and stakes lack a unified system for managing their cognitive, emotional, and physiological state in relation to their strategic priorities. They operate without observability—making trade-offs reactively, deferring critical decisions, and prioritizing short-term dopamine over long-term leverage.

### Problem Impact

Without an operating model:
- **Burnout** from pushing through degraded states without awareness
- **Strategic drift** where urgent consistently displaces important
- **Decision debt** from choices made under suboptimal conditions
- **Pattern blindness** repeating the same failure modes without learning
- **Misalignment** between daily actions and what actually matters

The cost is not just productivity loss—it is compounding damage to decision quality, health, relationships, and long-term positioning.

### Why Existing Solutions Fall Short

| Solution Type | Fundamental Limitation |
|---------------|----------------------|
| **Task managers (GTD, Todoist)** | No state awareness; treats all days as equal |
| **Time-blocking** | Assumes consistent energy; no adaptation when state degrades |
| **Habit trackers** | Gamification without insight; no decision protection |
| **Journaling apps** | Manual reflection; no pattern extraction or feedback loop |
| **Health trackers** | Physiology isolated from cognition and strategy |

**The deeper issue:** These tools exist in isolated domains. No one has built a unifying model of the human as an integrated system because:
1. It spans disciplines that are siloed by design
2. It requires longitudinal memory most tools avoid
3. It needed adaptive reasoning (LLMs) that only recently became practical
4. It must optimize for correctness over engagement—a counter-cultural stance
5. It demands systems taste, not just intelligence

### Proposed Solution

Veto is a **CLI-first MCP server** built in **Node.js/TypeScript** that provides the data and command layer for a cognitive operating system. **Claude Code serves as the reasoning layer**, orchestrating the system through structured tool calls.

#### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLAUDE CODE                            │
│         (LLM reasoning layer - already exists)              │
│   Thinking Engine, Emotional Guardrail, State Assessment    │
└─────────────────────────┬───────────────────────────────────┘
                          │ orchestrates via MCP tools
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    VETO CLI / MCP SERVER                    │
│           (Node.js/TypeScript data + command layer)         │
│   Tasks, Segments, State Logs, Learning Records, Outcomes   │
└─────────────────────────┬───────────────────────────────────┘
                          │ persists to
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                               │
│              (PostgreSQL + real-time)                       │
│   Tasks DB, Learning DB, State History, Outcome Tracking    │
└─────────────────────────────────────────────────────────────┘
                          │ syncs with
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE CALENDAR                           │
│            (real-world scheduling layer)                    │
│   Events, Time Blocks, Meetings, Deep Work Windows          │
└─────────────────────────────────────────────────────────────┘
```

#### Core Modules (Reasoning Layer - Claude Code)

1. **Founder State Router (FSR)** — Assesses physiological and cognitive readiness, produces Execution Profiles aligned with circadian rhythms
2. **Task Management Pro (TMP)** — Transforms tasks into state-aware execution plans with progress tracking
3. **Outcome Architect (OA)** — Ensures all work maps to defined strategic outcomes; prevents drift
4. **Thinking Engine (TE)** — Structured deep reasoning pipeline (Activation → Amplification → Meta) for high-leverage decisions
5. **Emotional Guardrail (EG)** — Protects decision quality by blocking high-stakes work during compromised states

#### MCP Tools (Data Layer - Veto CLI)

| Tool | Function |
|------|----------|
| `veto_assess` | Log current state, return Execution Profile |
| `veto_plan` | Generate daily plan based on state + tasks + calendar |
| `veto_start_segment` | Start tracking a work segment |
| `veto_end_segment` | End segment, log duration + focus score |
| `veto_wrap_day` | Generate daily summary, update Learning DB |
| `veto_sync_calendar` | Read/write Google Calendar events |
| `veto_query_patterns` | Query Learning DB for insights and trends |
| `veto_get_outcomes` | Retrieve active outcomes for alignment checks |
| `veto_log_decision` | Record Thinking Engine decisions to Knowledge Log |

#### Data Stores (Supabase)

- **Tasks** — Current tasks with segments, outcomes, status, estimates
- **State Logs** — Timestamped energy, focus, mood, circadian phase
- **Learning DB** — Daily performance records for pattern extraction
- **Outcomes** — Strategic outcomes with success criteria and time horizons
- **Knowledge Log** — Thinking Engine decisions and meta-learnings

### Key Differentiators

| Differentiator | Description |
|----------------|-------------|
| **Cross-domain integration** | Unifies physiology, cognition, emotion, and strategy as one system |
| **Longitudinal learning** | Today is interpreted in context of accumulated history; patterns emerge over weeks |
| **Adaptive reasoning** | Claude Code provides contextual synthesis without pre-coded edge cases |
| **Guardrails that say "no"** | Optimizes for decision quality and sustainability, not output volume |
| **Systems architecture** | Operating model, not feature accumulation; restraint over bloat |
| **CLI-first + MCP native** | Direct integration with Claude Code; future extensibility to mobile/web |
| **Calendar-aware** | Real-world scheduling integration, not isolated task management |
| **Built for one first** | Validated through lived experience before productization |

---

## Strategic Positioning

*Refined through multi-agent analysis (PM, Architect, Analyst, UX Designer)*

### Core Positioning

Veto is not a productivity tool. It is a **cognitive authority** that earns trust through prediction accuracy. The product's core value is the right to say "no" — and be correct.

> *"Veto does not promise to make you more productive. It promises to be right about when you shouldn't try."*

### Target User

**Primary audience:** Solo founders, senior ICs, staff+ engineers, early CTOs, and research leads who no longer trust their own state as a reliable control surface.

**Defining characteristics:**
- Already accept that cognition can be externalized and augmented (LLM users)
- Operate in high-stakes, ambiguous environments
- Experience real downside from poor decision timing
- Dissatisfied with productivity tools that optimize output over correctness
- **Thinking quality is their bottleneck**

**Who this is NOT for:**
- People who want to "get more done"
- Mass-market wellness seekers
- Users who need motivation or gamification
- Anyone uncomfortable with a system that contradicts them

### Primary Differentiator

**Guardrails that refuse.**

Most tools optimize engagement. Veto optimizes correctness.

- **Productivity tools**: Help you do more → Veto helps you do **right**
- **Wellness apps**: Track your state → Veto **acts on** your state
- **AI assistants**: Answer questions → Veto **refuses to answer** when conditions are wrong

The wedge is *refusal as a feature*. Blocking deep work, blocking decisions, forcing deferral, enforcing recovery — these are things users say they want but tools are afraid to do.

Veto protects users from subtle self-harm through bad timing and state blindness.

### Trust Model

**Trust is epistemic, not emotional.**

Veto earns authority over time through demonstrated prediction accuracy. This implies:

| Phase | Behavior | User Experience |
|-------|----------|-----------------|
| **Week 1** | Suggestions only | System observes, user retains full control |
| **Week 2-3** | Guardrails activate | System begins refusing based on accumulated data |
| **Week 3+** | Prediction accuracy visible | User can verify system was right X% of the time |

**The "aha moment":** When the system contradicts the user ("you shouldn't do deep work right now") and is later proven correct. That's when Veto stops being a tool and becomes a trusted operator.

**Design implications:**
- Show your work: expose the data behind every recommendation
- Track prediction accuracy: let users see the system's track record
- Celebrate correct refusals: gently surface patterns when overrides lead to poor outcomes
- Observability for the user: metrics and patterns are inspectable, not black-box

### Architecture Philosophy

**Veto is not an AI product. It is a systems product that uses AI.**

This distinction matters:
- LLM is a **component**, not the product
- Deterministic systems (SQL) handle what can be deterministic (metrics, aggregations)
- AI handles synthesis and judgment (pattern interpretation, rule evolution)
- The system remains auditable and explainable

This mirrors how the human brain works: sensory aggregation plus narrative synthesis.

### Go-to-Market Implications

This positioning implies:
- No free trial that judges value in 7 days (trust takes 2-3 weeks)
- No onboarding that promises instant results
- Marketing speaks to capability, not aspiration
- Success stories focus on "the system was right when I was wrong"
- Community of practice, not mass adoption

---

## Target Users

*Refined through multi-agent validation (PM, Analyst, UX Designer, Test Architect)*

### Primary User Archetype

Veto serves a single user archetype with role variations. The system is **state-specific, not role-specific**.

**Core Profile:**
- High autonomy, high cognitive load, high cost of subtle errors
- Low tolerance for shallow tools, comfort with delayed payoff
- Already uses LLMs as cognitive tools
- Does not need motivation — needs protection from state blindness
- Has crossed the threshold where raw intelligence is no longer enough

---

### Persona 1: Alex

**Demographics:** 34, Solo founder or Staff+ engineer at a fast-growing company

**Context:**
- Technically excellent, high agency, already using LLMs daily
- Lives in their head, not short on ideas or motivation
- Has real downside from bad calls that compound over weeks
- Not disorganized — overloaded with judgment calls

**Problem Experience:**
- Already plans, reflects, journals, tracks
- Lacks an external system that can tell them when their internal signals are lying
- Makes decisions while emotionally loaded but rationalizes them as objective
- Overrides fatigue with willpower, leading to subtle quality erosion

**Success Vision:**
A system that distinguishes "feels fine" from "actually compromised" — and is proven right often enough to be trusted.

---

### Persona 2: Maya

**Demographics:** 38, Early CTO or research lead

**Context:**
- Manages deep technical work plus people and cross-team coordination
- Highly capable but chronically context-switched
- Feels subtle erosion of thinking quality over time

**Problem Experience:**
- Cannot reliably tell when she is thinking well
- Emotional residue from meetings accumulates invisibly
- Makes strategic decisions during compromised windows without awareness

**Success Vision:**
A system that protects her best thinking from her own state blindness — especially during high-stakes moments.

---

### Why These Are the Same Persona

Alex and Maya differ in surface context (founder vs. CTO, IC vs. manager), but share:

| Trait | Description |
|-------|-------------|
| **High autonomy** | No one tells them when to stop |
| **High cognitive load** | Constant judgment calls, not routine tasks |
| **High cost of subtle errors** | Mistakes compound over weeks, not days |
| **Low tolerance for shallow tools** | Already rejected productivity apps |
| **Comfort with delayed payoff** | Willing to invest 2-3 weeks before seeing value |

The system does not change meaningfully between them. Only task mix and outcome mappings change.

---

### Behavioral Targeting Filter

Beyond psychographics, target users who exhibit this **observable behavior**:

> **"Users who have tried and abandoned 2+ productivity systems in the past year."**

This signals:
- Willingness to experiment (they sought solutions)
- Dissatisfaction with existing tools (they abandoned them)
- Still searching (they're receptive to something different)

**Combined targeting filter:**
- Actively uses LLMs for thinking or building
- Has abandoned at least 2 productivity systems
- Talks about decision quality, not output volume

---

### Distribution Channels

The target user leaves observable trails. They cluster around **thinking tools**, not productivity brands.

| Channel | Who's There |
|---------|-------------|
| **LLM power-user spaces** | Claude Code users, Cursor/Aider power users, prompt architecture discussions, agent workflow builders |
| **Tools-for-Thought refugees** | Former Roam/Obsidian/Logseq super-users who quietly stopped evangelizing; signals: "I used to use X but it stopped helping" |
| **Founder cognition conversations** | Indie founders, solo founders, early CTOs discussing decision fatigue (not hustle); strong rejection of "optimize your morning routine" content |
| **Quiet builders** | "Building in public" alumni who went silent — not because they quit, but because stakes increased |

**Where they are NOT:**
- Mass productivity YouTube
- Hustle culture communities
- Wellness and self-care spaces
- Enterprise software channels

---

### Secondary Users

**Veto is intentionally a single-player system.**

Secondary beneficiaries exist indirectly but are not users:
- An executive coach might review exported insights
- A spouse benefits from fewer stress-driven decisions
- A team benefits from better leadership timing

**Why no multi-user support:**
The moment this becomes social or collaborative, it collapses into performance theater. The system only works if the user can be radically honest without being observed.

---

### User Journey

#### Discovery
- Finds Veto through word-of-mouth in high-agency communities
- Attracted by the contrarian positioning: "a system that says no"
- Already dissatisfied with productivity tools; skeptical but curious

#### Onboarding (Week 1)
- Sets up CLI, connects Supabase, authenticates Google Calendar
- Begins daily state logging: energy, focus, mood, sleep
- System observes and suggests — does not yet refuse
- User retains full control while baseline accumulates

#### Week 1 Value: Mirroring Before Control

What keeps the user logging on Day 4 is not hope of magic. It's the feeling that **the system is paying attention better than they are.**

Week 1 delivers epistemic value through:

| Value Type | Example |
|------------|---------|
| **Retrospective insight** | "Your highest focus this week occurred 9-11am on days with <2 meetings" |
| **Mirror effects** | "Your perceived energy did not correlate with completion this week" |
| **Confidence indicators** | "Confidence: low / building / medium" displayed explicitly |

The system shows it's *learning* before it starts *refusing*.

#### Early Usage (Week 2-3)
- Guardrails begin activating based on accumulated data
- **Guardrails are confidence-gated** — they only activate when the system has sufficient data
- First "the system contradicted me" moment occurs
- User may override, perform poorly, and see the pattern surface
- Trust begins forming — epistemic, not emotional

**Key principle:** An early wrong "no" is fatal. A late but correct "no" builds lifelong trust.

When confidence is insufficient, the system says:
> "I am not confident enough yet to block this. Logging outcome instead."

#### Core Usage (Week 3+)
- Daily workflow: Assess → Plan → Execute (segments) → Wrap
- System blocks deep work during compromised states
- Thinking Engine sessions gated by Emotional Guardrail
- User sees prediction accuracy metrics ("system was right 78% of the time")

#### Success Moment
The "aha" is not a clean dashboard or smart plan. It's the moment when:
> "I wanted to push through, the system said don't, and later I realized it was right."

That's when Veto stops being a tool and becomes a trusted operator.

**Key metric:** Track **time-to-first-correct-refusal** — that's the moment trust crystallizes.

#### Long-term
- Veto becomes invisible infrastructure for cognitive operations
- Weekly reflections surface multi-week patterns
- User's operating model evolves based on their own data
- System earns increasing authority through demonstrated accuracy

---

### Trust Mechanics

| Mechanism | Implementation |
|-----------|----------------|
| **Confidence-gated guardrails** | System only refuses when confidence threshold is met |
| **Visible uncertainty** | "Confidence: low" shown explicitly; users tolerate delay if honest |
| **Override tracking** | Overrides allowed and logged; outcomes correlated with override decisions |
| **Post-hoc analysis** | Misses are surfaced and learned from; not hidden |
| **Prediction accuracy display** | Users can verify "system was right X% of the time" |

**Failure mode mitigation:**

| Risk | Mitigation |
|------|------------|
| False positive guardrail | Show reasoning, allow override with tracking |
| False negative (permitted when shouldn't) | Post-hoc analysis surfaces the miss |
| Override addiction | Track override accuracy, surface patterns |
| Data integrity (inaccurate logging) | Correlate self-report with outcomes, detect drift |
| Cold start dropout | Week 1 micro-value through mirroring |

---

### Growth Model

**Veto grows by reputation, not virality.**

This is an intentional design choice:
- No social features that would corrupt honesty
- No team/org expansion path
- No viral loops or referral mechanics
- Growth through depth of value, not breadth of users

**Implications:**
- Community of practice over mass adoption
- Word-of-mouth in trusted circles
- Content speaks to capability, not aspiration
- Success stories: "the system was right when I was wrong"

---

### Who This Is NOT For

| Exclusion | Reason |
|-----------|--------|
| People who want to "get more done" | Veto optimizes correctness, not output |
| Mass-market wellness seekers | Too much friction, too slow to value |
| Users who need motivation | System assumes capability, not aspiration |
| Anyone uncomfortable with contradiction | System will say "no" and be right |
| Teams or organizations | Single-player only; honesty requires privacy |
| Users unwilling to invest 2-3 weeks | Trust takes time; no quick payoff |

---

## Success Metrics

*Success for Veto is defined by decision quality and trust formation, not activity.*

### Core Success Philosophy

Traditional tools succeed by increasing activity.
**Veto succeeds by preventing invisible failure.**

The ultimate success metric:
> **When Veto intervenes less often over time, and is trusted more when it does.**

---

### User Success Metrics

#### Primary: Reduction in Decision Regret

Not fewer decisions. Not faster decisions. **Fewer decisions users later reverse, second-guess, or quietly undo.**

| Indicator | What It Measures |
|-----------|------------------|
| Late-night reversals | Decisions made in compromised states that are undone |
| "Should not have sent that" moments | Emotional decisions rationalized as logic |
| Strategy drafts rewritten next day | Deep work done during wrong windows |
| Post-decision regret frequency | Self-reported or inferred from patterns |

**This is the core value. Everything else is downstream.**

#### Secondary: Shift in Override Behavior

Early users override often. Successful users override selectively.

| Metric | Target Trajectory |
|--------|-------------------|
| Override frequency | Decreases over time |
| Override accuracy | Increases when overrides happen |
| Override regret rate | "I overrode and regretted it" decreases |

**Success signal:** Users say "I wanted to override, but I didn't, and I'm glad."

#### Enabling: The "Seen" Moment

Trust forms when:
- System predicts a bad call before it happens
- System explains why clearly
- User later recognizes the explanation as accurate

**This is how trust forms, but trust only sticks if the outcomes follow.**

---

### Key Performance Indicators

| KPI | Definition | Target |
|-----|------------|--------|
| **Time-to-first-correct-refusal** | Days until system correctly blocks an action the user later agrees was right | < 21 days for qualified users |
| **Prediction accuracy rate** | % of guardrail activations validated as correct by outcome | > 75% after Week 3 |
| **Week 3 retention** | % of qualified users still logging state at Day 21 | > 60% |
| **Override regret correlation** | % of overrides that lead to negative outcomes | Decreasing over time |
| **State logging consistency** | % of days with state input in active weeks | > 80% |
| **Trust verbalization** | Users can articulate why the system is useful | Qualitative check at 30 days |

---

### Anti-Metrics (What NOT to Optimize)

| Anti-Metric | Why It's Misleading |
|-------------|---------------------|
| Daily active time | More time ≠ more value; efficiency matters |
| Tasks completed | Output volume isn't the goal |
| Guardrail activation count | More isn't better; accuracy matters |
| Feature usage breadth | Depth > breadth |
| User count growth | Quality of users matters more than quantity |

---

### Business Objectives

#### Business Model: Paid Personal Subscription

**Why subscription:**
- Users have money (high-agency professionals)
- Value is ongoing, not one-time
- Pricing reinforces seriousness and commitment
- Discourages casual misuse and misaligned users

**Pricing philosophy:**
- "This is not a productivity app"
- "This is not for everyone"
- "You are paying for correctness, not features"
- **Price point:** Low hundreds per year (not tens per month)

**What NOT to optimize for:**
- Seat expansion
- Virality
- Team upsell
- Enterprise conversion

These incentives would corrupt the product. Veto remains deliberately single-player and high-trust.

---

### Success Horizons

#### At 3 Months

Veto is working if:

| Signal | Measurement |
|--------|-------------|
| Cohort still logs state consistently | > 60% of qualified users |
| Week 3 retention is strong | Among users who pass behavioral filter |
| At least one correct refusal per user | Acknowledged by user |
| Users articulate value in own words | Qualitative interviews |
| Override regret correlation improving | Directional trend |

**Qualitative signal to listen for:**
> "It caught me before I did something stupid."

#### At 12 Months

Veto is truly working if:

| Signal | Description |
|--------|-------------|
| Users trust delays | They defer decisions without resentment when system advises |
| Guardrails rarely questioned | Trust is established |
| System is "part of how I work" | Not described as a tool, but as infrastructure |
| Longitudinal patterns referenced | Users cite their own data in planning |
| Users think better | Not "I do more" but "I think better" |

**Qualitative signal:**
> "I don't need it every day, but when it speaks, I listen."

---

### The Rare Metric

The success metric that matters most is paradoxical:

**Intervention frequency decreases while intervention trust increases.**

A system that speaks less and is trusted more is the goal.

This is the opposite of engagement optimization.
It is the correct metric for a cognitive authority.

---

## MVP Scope

*The MVP is not "the smallest product that works." It is the smallest system that can earn authority.*

### Framing Principle

Anything that does not directly increase the probability of a **correct refusal within 21 days** is out. Not postponed. Out.

Veto earns trust in exactly one way in the MVP:

> **observing state → correlating outcomes → refusing at the right time → being right**

Everything else is optional until that loop works.

---

### Core Features (MVP)

#### MCP Tools (Day 1)

| Tool | Function | Why Essential |
|------|----------|---------------|
| `veto_assess` | Log current state | Primary signal ingestion; without this, no learning |
| `veto_plan` | Generate daily plan | Anchors intent vs state, even if primitive |
| `veto_start_segment` | Start tracking segment | Establishes execution boundaries |
| `veto_end_segment` | End segment with outcome | Produces outcome-linked evidence |
| `veto_wrap_day` | Generate daily summary | Feeds Learning DB, closes the loop |
| `veto_query_patterns` | Query patterns for insights | Enables guardrails to exist |

**These six form the minimum closed loop.**

#### Modules (MVP Scope)

| Module | MVP Scope | Rationale |
|--------|-----------|-----------|
| **Founder State Router (FSR)** | Stripped: energy, focus, mood, circadian phase only | Core state assessment |
| **Task Management Pro (TMP)** | Segments only; no decomposition, no prioritization | Execution tracking |
| **Emotional Guardrail (EG)** | Single guardrail only (deep work refusal) | The core differentiator |

**MVP Veto is not strategic. It is protective.**

#### The ONE Guardrail

**Deep Work Refusal Based on State + History**

Do not build multiple guardrails. That dilutes learning.

This guardrail:
- Triggers only for deep work segments
- Uses: current energy, current focus, circadian phase, recent override outcomes
- Refuses with: short explanation, visible confidence level, explicit override option

---

### Confidence Mechanics

*Refined through technical validation*

#### Confidence Calculation

A simple, transparent heuristic. Veto wins by being **legible**, not clever.

```
confidence = min(
  days_of_data / 14,           // Data volume factor (0-1)
  similar_state_count / 5,     // Pattern frequency factor (0-1)
  outcome_correlation_strength // Statistical significance (0-1)
)
```

**Why this works:**
- Encodes time (days of data)
- Encodes repetition (similar state count)
- Encodes outcomes (correlation strength)
- Explainable to the user

> If the user cannot understand why the system is confident, authority will never form.

#### Confidence UI

The system must show its confidence state explicitly:

```
System confidence: 47% (building)
Guardrails: inactive until 70%
```

**This does three things:**
1. Manages expectations
2. Reframes waiting as progress
3. Prevents premature authority claims

#### Confidence Threshold

**70%** is the threshold for guardrail activation.

Rationale:
- 60% feels arbitrary and weak
- 80% takes too long and risks boredom
- 70% signals "I am usually right, but not infallible"

This number is visible to the user but fixed for MVP.

---

### Refusal UX

*Soft block with friction*

Hard blocks create resentment. Silent warnings are ignored. **Friction forces a conscious choice.**

#### Example Refusal Interaction

```
⚠️ Deep work not recommended right now.

   Reason: Energy 4/10, similar states led to poor outcomes 3/4 times.
   Confidence: 72%

   [O] Override and proceed
   [D] Defer to later
   [S] Switch to shallow work
```

**Design principles:**
- Refusal is calm
- Reasoning is explicit
- Override is possible but not free (requires keystroke)
- Alternative paths are suggested

The keystroke requirement creates a moment of reflection without moralizing.

---

### Post-Hoc Assessment

*Explicit first, inferred later*

#### MVP Implementation

At `veto_wrap_day`, the system explicitly asks:

```
You overrode a refusal today for segment [X].
Did that turn out well?

[Y] Yes, the override was correct
[N] No, I should have listened
[M] Mixed / unclear
```

**Why explicit first:**
- Trains the user to reflect
- Grounds learning in conscious judgment
- Avoids premature inference errors

Later phases can add inference from focus scores and completion patterns. In MVP, ask the user.

---

### Data Model (Supabase)

#### Required Tables

**1. state_logs**
| Field | Type | Description |
|-------|------|-------------|
| date | date | Log date |
| energy | int (1-10) | Self-reported energy |
| focus | int (1-10) | Self-reported focus |
| mood | enum/text | Emotional tone |
| sleep_hours | float | Hours slept |
| circadian_phase | enum | Derived from wake time |
| confidence | float | System-estimated reliability |

**2. segments**
| Field | Type | Description |
|-------|------|-------------|
| segment_id | uuid | Unique identifier |
| date | date | Segment date |
| intended_type | enum | deep / shallow |
| start_time | timestamp | When started |
| end_time | timestamp | When ended |
| completion | boolean | Finished? |
| focus_score | int (1-10) | Post-segment self-report |
| override_flag | boolean | Did user override a refusal? |

**3. daily_summaries**
| Field | Type | Description |
|-------|------|-------------|
| date | date | Summary date |
| completion_ratio | float | % segments completed |
| mean_focus | float | Average focus score |
| energy_trend | enum | rise / stable / dip |
| notable_events | text | Short observations |

**4. refusal_events** *(critical for trust measurement)*
| Field | Type | Description |
|-------|------|-------------|
| date | date | Refusal date |
| segment_id | uuid | Associated segment |
| refusal_type | enum | Type of refusal |
| confidence_at_refusal | float | System confidence when refusing |
| user_overrode | boolean | Did user override? |
| outcome_quality | enum | Post-hoc assessment (good/neutral/poor) |

**Without refusal_events, you cannot measure trust, accuracy, or learning.**

---

### Out of Scope for MVP

#### Explicitly Excluded

| Item | Reason |
|------|--------|
| `veto_log_decision` | Thinking Engine introduces too many failure modes early |
| `veto_get_outcomes` | Outcome Architect is post-MVP |
| Outcome Architect module | Strategic alignment is orthogonal to trust formation |
| Thinking Engine module | Requires high trust; adds irreversible damage if wrong early |
| Multiple guardrails | Dilutes learning; one guardrail must work first |
| Dashboards / visualizations | Insight > dashboards; adds complexity without trust value |
| Multi-user anything | Destroys honesty and slows iteration |
| Advanced recovery protocols | Nice, not essential for refusal loop |

#### Deferred to Phase 1.5 (Days 10-21)

| Item | Rationale |
|------|-----------|
| `veto_sync_calendar` (read-only) | Meetings are largest state disruptor, but integration complexity risks early trust |
| Calendar-aware state modification | Used only as state modifier, not auto-planning |

**Phase 1 (Days 1-10):** Manual declaration ("heavy meeting day" / "light meeting day")
**Phase 1.5 (Days 10-21):** Read-only calendar ingestion as state modifier

---

### README as Scope

*Part of MVP, not afterthought*

The README is not marketing. It is a **boundary-setting device**.

**It must be written before code begins.**

The README should:
- Explicitly state who this is NOT for
- Warn about delayed payoff (2-3 weeks)
- Explain that the system will sometimes say no
- Reject productivity framing outright
- Set expectation that trust is earned, not given

**Success criterion for README:**
> If someone reads it and opts out, that is a success.
> If no one opts out, the README has failed.

---

### Implementation Timeline

| Week | Focus | Deliverables |
|------|-------|--------------|
| **Week 0** | Spike + README | MCP integration spike; README written |
| **Week 1** | Data layer | Supabase schema; `veto_assess`; `veto_wrap_day` |
| **Week 2** | Execution tracking | `veto_start_segment`; `veto_end_segment`; refusal_events |
| **Week 3** | The guardrail | `veto_query_patterns`; `veto_plan` with refusal logic; confidence calculation |
| **Week 4** | Polish + first user | End-to-end testing; first real user onboarding |

---

### MVP Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Closed loop functions | State → Segments → Outcomes → Patterns → Refusal |
| First correct refusal occurs | Within 21 days for active users |
| Refusal accuracy > 70% | Based on post-hoc outcome assessment |
| User can articulate value | "It caught me before I did something stupid" |
| System feels precise | "Simple, but oddly precise" |
| Confidence UI works | User understands why guardrails are/aren't active |

**Go/no-go decision point:** After 10 qualified users complete Week 3, if refusal accuracy is below 60%, the model needs recalibration before scaling.

---

### Future Vision

#### Phase 2: Strategic Layer
- Outcome Architect integration
- Multi-outcome alignment checking
- Strategic drift detection

#### Phase 3: Deep Reasoning
- Thinking Engine activation
- High-stakes decision gating
- Knowledge Log persistence

#### Phase 4: Full Integration
- Write access to Google Calendar (time blocking)
- Advanced pattern detection
- Predictive state modeling

#### Calendar Integration Roadmap (Expanded)

*Added based on founder usage patterns - 2026-01-17*

**Problem observed:** Deep work windows (e.g., 6-11 AM) are often claimed by reactive work (Slack, meetings) without awareness. The user intends deep work but defaults to availability.

**Calendar as observability layer:**

| Capability | Value |
|------------|-------|
| See intended structure | Deep work blocks vs. meeting blocks as declared |
| Detect drift | "You blocked 6-11 AM for deep work but accepted 3 meetings" |
| Correlate with state | "Your 8 AM state was high-energy, but you spent it on Slack triage" |
| Reality check | "You planned 5 deep work hours this week, you got 1.5" |
| Protect windows | Alert when someone tries to book into protected time |

**Implementation phases:**
1. **Phase 1.5:** Read-only calendar ingestion as context for state assessment
2. **Phase 4:** Write access for time blocking and protected window enforcement
3. **Future:** Calendar as guardrail trigger ("You have 6 hours of meetings today - deep work not recommended")

#### Long-term
- Mobile companion (state logging on the go)
- Voice interface for quick state input
- Export/integration for coaching contexts

**The MVP must prove the trust loop before any of this matters.**

---

### MVP in One Sentence

> **The Veto MVP is a single-user, state-aware system that observes daily work, learns from outcomes, and earns trust by being right when it refuses deep work — nothing more.**

### Success Feeling

If a user says:

> "This feels simple, but oddly precise."

The MVP is scoped correctly.
