# Judgment Engine Deep Dive - January 26, 2026

## Context
Technical deep-dive on the Judgment Engine project - understanding what's been built from a product standpoint

## Attendees
Akshay Ghurye, Randy Herzog, Kamran Malik, Tim Crowe, Luke Kiely

## Summary
- **Judgment Engine**: System for encoding business policies as auditable workflows
- **Demo**: Kamran showed Loom video of application review workflow for Evergreen
- **Core use case**: Automate application review with human intervention at decision points
- **Key insight**: This creates a "to-do dashboard" approach to Ender - manage objects by acting on them
- **Current state**: MVP - captures workflow execution but not human judgment rationale yet

## Architecture Concepts

### Hierarchy
```
Flow (e.g., "Application Review")
  └── Judgment Block (e.g., "Pet Validation")
        └── Node (e.g., breed check, weight check, count check)
```

### Terminal States
1. **Success** - approve or reject application
2. **Man-in-middle** - human intervention needed (creates task)
3. **Error** - workflow didn't run correctly

### Key Design Decisions
- **Idempotent re-execution**: When human resolves issue, entire workflow re-runs (not resume)
  - Reason: Don't know what else changed; policy might have updated; avoids complex orchestration state
- **Sequential execution**: Nodes run sequentially (not parallel) - runs in <3 seconds anyway
- **Auditability**: Every step captures input/output automatically via framework classes

## How It Works (Pet Example)

1. Applicant submits with pit bull
2. Pet validation block fails → creates PM task + emails tenant
3. Tenant updates pet info OR PM overrides policy
4. PM clicks "re-run workflow"
5. Workflow re-evaluates from start with new data
6. Continues until terminus (approve/reject)

## What's Built vs Not Built

**Built:**
- Workflow execution framework with audit trail
- Task creation on halting conditions
- Email notifications to tenants
- PM review task at end (even if all passes)
- UI showing workflow runs and step-by-step results

**Not built (MVP scope):**
- Capture of human judgment rationale
- Support flows for each intervention type
- SLA tracking per issue subtype
- Parallel node execution
- AI integration for decision-making

## Randy's Vision

> "Human work is just a series of strongly typed tasks until they're unknown"

- Break every intervention into support flows
- Capture micro-decisions to identify automation opportunities
- Goal: 5 days for next workflow, then 3 days for the one after
- End state: Ender becomes a task queue ranked by SLA

## Tim's Observation

Comparison to AWS Step Functions - similar pattern of:
- Workflow as code
- Steps can be automated or manual
- Parallel execution as future feature
- Idempotency over state resumption

## Action Items
- [ ] @me: Pick another use case to walk through judgment engine framework
- [ ] @Randy: Share documentation on flows/judgment blocks/nodes
- [ ] @Kamran: Update Randy's docs with runtime implementation details
- [ ] @all: Continue conversation Wednesday for PR/engineering review

## Follow-up
- Wednesday meeting: Engineering review of Kamran's PR
- Next use case walkthrough (maintenance suggested)

## Reflections
- Framework captures "what happened" but not yet "why human decided X"
- Randy's mental model: every manual step is future automation candidate
- Tim's point on semantics: "failure" vs "reason to reject" - important distinction
- Luke interested in how this connects to AI policy/knowledge management (separate product)

---
*Documented: 2026-01-29*
