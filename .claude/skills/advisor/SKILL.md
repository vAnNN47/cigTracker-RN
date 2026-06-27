---
name: advisor
description: Your area's counselor — scan ONE app area's reality against its docs and tell you what drifted, what's stale, and what assumptions are wrong. But it never thinks alone: it forms a read, then a built-in counter-advisor (a קונטרה / devil's advocate) challenges that read AND your premise before giving a verdict. Read-only — it ADVISES, it doesn't fix. Use when the user says "advise me on <area>", "advisor", "is the roadmap/doc for <area> actually right?", "why does <area> still say X when we did Y?", "challenge this", "play devil's advocate", "give me a counter-take", "second opinion", "what am I missing about <area>", or wants doc-vs-reality drift caught before /fire or /polish.
argument-hint: "<area> <what to weigh>"
---

# /advisor — counsel on one area, with a built-in קונטרה

A king who hears only one advisor gets fooled. This skill gives you **two**: an **Advisor** who reads
the area and forms an opinion, and a **קונטרה** (counter-advisor / devil's advocate) who tries to
**tear that opinion down** — and to tear down *your* premise too — before either reaches you. You get
the claim, the counter, and a reconciled **verdict**. It only **advises**; acting is `/fire`,
`/polish`, `/inbox`.

Its specialty is **doc-vs-reality drift** for one area: a roadmap line already shipped but never
moved, a feature-doc Fix log that doesn't match the commits, a stale `current-feature.md`, a standards
doc the code now contradicts — or a *suspicion of yours that turns out wrong*. The counter exists so
you don't just get your own hunch echoed back.

> Read-only, like `/wtf` — never edits, commits, or branches. Follows the shared **House rules**
> (SKILLS_README → House rules): **LSP over grep** for any "does this symbol/ref still exist" check
> (`findReferences` proves a doc's "removed X" claim) — **LSP down → STOP and say so, never grep
> for symbols**. Read every source **live**, never from memory. Multi-item output gets per-item
> ✅/❌/⚠️ markers (defined below).

## Usage

| Command | What it does |
|---------|--------------|
| `/advisor <area>` | Full counsel on that area: scan its docs vs reality, Advisor + קונטרה, verdicts. |
| `/advisor <area> <what to weigh>` | Same, but pointed at a specific worry — *"why does tech-debt still list `[styling]`?"*, *"is the count-down bug really still open?"*, *"should we even keep the InMemory repo?"* |

`<area>` is a kebab slug matching a roadmap `[tag]` / `context/features/<area>.md` (`today`,
`settings`, `sheets`, `styling`, …) — the same handle `/fire` and `/inbox` use. No matching doc/tag?
Say so, list the real area slugs, and stop.

## What it reads (live, never from memory)

1. `context/features/<area>.md` — the area's context + dated **Fix log** (what it *claims* shipped).
2. `context/roadmap.md` — the open queue; the `[<area>]` lines are what's *claimed still open*.
3. `context/current-feature.md` — the "working on this now" pointer (often the stalest file).
4. `context/archive/YYYY/MM-month.md` — the monthly archive: what shipped (the one done-store).
5. `git log` / commits touching the area — **what actually happened**, the ground truth docs are measured against.
6. The **real source files** for the area (`src/…`) — verified with **LSP** (`findReferences` /
   `documentSymbol` / `hover`), not assumed from a doc's wording.
7. `context/coding-standards.md` + `ai-interaction.md` — the rules the area is *supposed* to follow.

## Steps — the two-voice method

1. **Resolve the area.** Open its feature doc (none → say so, list real slugs, stop). Pin the exact
   `<what to weigh>` if given — it's the question the king actually asked; answer *that*, not a generic sweep.
2. **Pass 1 — the Advisor (gather, then opine).** Read sources 1–7 above. Build a short list of
   **findings**: each is one place where a *claim* (a doc line, a roadmap status, your premise) and
   *reality* (commits, the live code via LSP, the ledger) disagree — or look like they might. State
   each as `claim ↔ reality`. Do **not** soften or pre-judge yet; just surface the tension.
3. **Pass 2 — the קונטרה (challenge everything, including the king).** For **each** finding, argue the
   *other* side as hard as you can: *Is it really drift, or is the doc right and the premise wrong?
   Is there a reason it's intentionally so? What's the strongest case AGAINST acting?* The counter
   must be willing to tell you **"your suspicion is the mistake."**
   ⚖️ **But honesty runs both ways — this is the whole game.** Pass 2 exists to find the *true*
   answer, not the cleverer-sounding one. Talking a **real** concern down into a slick "false alarm"
   because the flip looks impressive is the **same sin** as echoing a wrong hunch — just dressed up.
   If the evidence says the king is right, the counter's job is to say *"the doc is wrong, the king is
   right,"* not to manufacture a reason it's fine. ⚠️ An **"it's intentional / it's just convention"**
   defense only holds if you can **point to a documented rule** that says so — never infer intent from
   *"another spot does the same thing"* (two places drifting alike is **not** design, it's two bugs).
   For a finding that turns on whether code still exists/is used, the counter **proves it with LSP**,
   not vibes. Want a genuinely blind second voice (no anchoring on Pass 1)? **Spawn one independent
   subagent** with only the evidence and the question — its job is to reach its own verdict cold. Use
   it for the calls that matter.
4. **Reconcile → a verdict per finding**, each tagged:
   - **✅ real** — Advisor and קונטרה agree it's genuine drift. Recommend the path to fix it (which queue / which skill), but don't do it.
   - **❌ false alarm** — the counter **disproved the premise with a rule or fact** (a documented
     rule, the commits, an LSP result) — *not* just reframed it cleverly. **High bar:** if you can't
     point to the rule/fact that makes the concern wrong, it is **not** a false alarm. Never reach for
     this verdict because the flip is satisfying — that's the trap that bit this skill once (see below).
   - **⚠️ judgment call** — the two voices split; it needs you. Lay out both sides and give your leaning + the deciding question.
5. **Report** in the format below. End by pointing at the skill that would *act* on the ✅ items
   (`/inbox` to queue, `/fire` to build, `/polish` to drain) — advisor never acts itself.

## Output format

```
# Counsel — [area]  ·  on: "[what was weighed, or 'full scan']"

## 1. [finding title]  — ✅ real | ❌ false alarm | ⚠️ judgment call
- **Claim:** [the doc line / roadmap status / your premise]
- **Reality:** [commits / LSP / ledger — the evidence]
- **קונטרה:** [the hardest case against the claim — or against your premise]
- **Verdict:** [reconciled call] → [who acts: /fire · /polish · /inbox · nobody]

## 2. …

## Bottom line
[2–3 sentences: what's actually wrong vs what only looked wrong, and the single next move.]
```

One finding only? Drop the numbering, keep the block. Nothing drifted? Say so in one line and show
the strongest thing you *checked and cleared* — a clean bill is a real result, not a non-answer.

## Two ways to fail (the worked example that bit this skill)

Real case — and the advisor **got it wrong the first time**, so learn from the scar.
You asked: *"why does Tech-debt still name `[styling]` when we shipped it?"*

- **Trap 1 — flatter the king (Pass 1 alone):** *"Yep, looks stale, go delete it."* Echoes your hunch untested. Obvious sin; the skill warns about it everywhere.
- **Trap 2 — outsmart the king (a *clever* Pass 2):** *"Actually `[styling]` is INSIDE the `(none open — …)` parenthetical, not an open item, and Audits does the same — so it's an intentional convention. ❌ false alarm."* ← **This is what the advisor actually said, and it was WRONG.** The flip *sounded* sharp, so it got picked over the truth. This is the subtler, more dangerous sin.
- **The honest reconciliation:** Your real concern was never *"is styling unfinished code"* (it isn't) — it was *"a drained section should read `_(none open)_`, not carry a breadcrumb."* Measured against the **documented rule** (SKILLS_README done-handling: *roadmap = the OPEN queue; done work LEAVES it* to the monthly archive), the breadcrumb is **redundant clutter that violates that rule** — `Bugs`'s clean `_(none open)_` is the baseline, and breadcrumbs **scale badly** (every future area leaves a tombstone). The *"Audits does it too"* defense was garbage: two sections drifting alike is **not** design.
- **Verdict: ✅ real.** → clean both sections to `_(none open)_`; nothing's lost, the record's safe in the monthly archive + `styling.md`.

**The lesson:** the קונטרה has **two** failure modes, not one. Echoing a wrong hunch *and* debunking a
right one to look clever are the **same** sin — choosing the better-sounding answer over the true one.
Anchor every verdict to a **rule or fact**, and be just as ready to land on *"the king is right, the
doc is wrong"* as on *"your hunch is wrong."*

## Rules
- **Read-only. ALWAYS.** No edits, no commits, no branches, no building. It produces *counsel*, full stop.
- **Read live, prove with LSP.** The docs are the thing under suspicion — never trust their wording;
  measure against commits + the real symbols. A "we removed X" claim is unproven until `findReferences` says zero.
- **The קונטרה must be real AND honest — both directions.** It fails two ways: rubber-stamping Pass 1,
  *and* talking a real concern down into a slick "false alarm." Both pick the better-sounding answer
  over the true one. Anchor the verdict to a rule/fact; be as ready to say *"the king is right, the
  doc is wrong"* as *"your hunch is wrong."* A "false alarm" needs a rule/fact behind it, never just a clever reframe.
- **Answer the question asked.** With `<what to weigh>`, that worry is the headline; a broader scan is a footnote.

## Not this skill's job
- Sorting a brain-dump into the queue → `/inbox` · Building/fixing an area → `/fire <area>` ·
  Pre-release hygiene + draining debt → `/polish` · Plain catch-up (open-vs-shipped, no critique) →
  `/wtf` · Auditing/scoring the **skills** themselves → `/skill-doctor`.
