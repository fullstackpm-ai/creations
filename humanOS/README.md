# HumanOS

A personal cognitive operating system that observes your state, protects decision quality, and learns how you actually work.

**This is not a productivity tool.**

---

## What HumanOS Does

HumanOS tracks your physiological and cognitive state, correlates it with outcomes over time, and learns when deep work tends to go well or poorly for you.

Once it has enough evidence, it will sometimes advise you not to do deep work, even when you feel like pushing through.

It earns the right to say no by being correct.

---

## Who This Is For

HumanOS is for people who:

- Already use LLMs as cognitive tools
- Have abandoned 2 or more productivity systems because they were too shallow
- Experience real downside from decisions made in the wrong state
- No longer trust their own judgment about when they are thinking clearly
- Are willing to invest 2 to 3 weeks before seeing value

**If your bottleneck is thinking quality, not effort, this might be for you.**

---

## Who This Is NOT For

Do not use HumanOS if you:

- Want to get more done
- Need motivation or accountability
- Expect instant results
- Are uncomfortable with a system that contradicts you
- Want dashboards, streaks, or gamification

This system will sometimes advise against working. If that sounds frustrating rather than valuable, this is not for you.

---

## How It Works

1. **You log your state**
   Energy, focus, mood, sleep.

2. **You work in segments**
   The system tracks what you intended to do versus what actually happened.

3. **It learns your patterns**
   Which states lead to good outcomes, which do not.

4. **It earns the right to refuse**
   After enough data, it can advise against deep work when conditions predict poor outcomes.

The first two weeks are observation. Trust typically forms in week three, when the system contradicts you and later turns out to be right.

---

## The Trust Model

HumanOS does not assume authority. It earns it.

- **Week 1:** Observation only. The system mirrors patterns back to you.
- **Week 2 to 3:** Guardrails activate once confidence reaches 70 percent.
- **Week 3 and beyond:** Accuracy becomes visible. You can see when it was right and when it was not.

The "aha moment" is not a dashboard.

It is when you wanted to push through, the system advised against it, you overrode or deferred, and later realized the advice was correct.

---

## What Success Looks Like

You are using HumanOS correctly if:

- You make fewer decisions you later reverse
- You override the system less often over time
- You say: "It caught me before I did something stupid"

You are not using it correctly if you are trying to extract more output from yourself.

---

## Technical Details

HumanOS is a CLI-first MCP server that integrates with Claude Code. You interact with it through simple commands during your day.

- **Stack:** Node.js and TypeScript with Supabase
- **AI:** Claude Code as the reasoning layer
- **Data:** Your state logs, segment outcomes, and learned patterns live in your own Supabase instance

You own your data. The system learns only from your history, not anyone else's.

---

## Getting Started

> **Note:** HumanOS is in early development. This README describes the intended system.

1. Clone the repository
2. Set up Supabase and configure credentials
3. Install the MCP server
4. Start logging state with `hos assess`

Detailed setup instructions are coming.

---

## FAQ

**How is this different from a habit tracker?**
Habit trackers reward consistency. HumanOS rewards correctness. Sometimes the correct action is to not work.

**Why does it take 2 to 3 weeks to see value?**
Because the system needs evidence. A system that guesses on day one will be wrong and lose your trust.

**What if I always override the guardrails?**
The system tracks override outcomes. If overrides repeatedly lead to regret, that pattern will surface clearly.

**Can I use this with a team?**
No. HumanOS is deliberately single-player. Honest state tracking requires privacy.

---

## Philosophy

> "Subjective experience is no longer a reliable control surface for high-stakes, high-complexity lives."

HumanOS exists because capable people still make preventable mistakes, not from lack of skill, but from lack of awareness about their own state.

It does not make you smarter. It helps you avoid being wrong at the wrong time.

---

## License

MIT
