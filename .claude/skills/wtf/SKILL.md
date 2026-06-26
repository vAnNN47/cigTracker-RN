---
name: wtf
description: The one "catch me up" button. After days away you forgot the app AND the commands — /wtf prints what's going on (open vs shipped work) + how your tools work, in one shot. Use when the user says "wtf", "catch me up", "what's going on", "what was I doing", "I forgot everything", "remind me my commands", "what's left", or asks what a skill/area is.
argument-hint: "[skill-name | area | since <date>]"
---

# /wtf — "I've been away. What is going on?"

You forget everything after a few days. This is the **one command you remember** so you never
have to remember the others. It catches you up on **two things at once**:

1. **The WORK** — what's still open, what just shipped (folds in the old `/recall`).
2. **The TOOLS** — what your slash-commands are and how to run them (folds in the old `/skills-help`).

Run `/wtf` with nothing → you get both. That's the whole point: **one button, full memory back.**

---

## 🐒 Read this first — skill vs area (the thing that confuses you)

You keep asking "wtf is the difference between a *skill* and an *area*." Here it is, dead simple:

| Word | What it is | Dumb version | Examples |
|------|-----------|--------------|----------|
| **skill** | A **command** you type (a `/word`). Lives in `.claude/skills/<name>/`. | A **tool in your hand**. The HOW. | `/fire`, `/inbox`, `/polish`, `/wtf` |
| **area** | A **part of the app** you'd cut a branch for — a tab, a sheet, a drawer. A `[tag]` in `roadmap.md`. | A **room in your house**. The WHERE. | `today`, `settings`, `sheets`, `slide-drawer` |

**One line:** a **skill** is a *thing you DO*; an **area** is a *place in the app you do it TO*.
You run a **skill** (`/fire`) on an **area** (`today`) → `/fire today`.

So when you type `/wtf today` — "today" is an **area** (a room) → I show you that room's work.
When you type `/wtf fire` — "fire" is a **skill** (a tool) → I explain that tool.

---

## 🎛️ The `[anything_here]` slot — EVERY thing you can type

`/wtf` takes **one optional word** after it. Here is **every** possibility and exactly what I do.
(I figure out which kind it is by checking: *is there a folder `.claude/skills/<word>`?* → it's a
**skill**. *Else* → I treat it as an **area** or a date.)

| You type | What kind of word it is | What I give you back |
|----------|------------------------|----------------------|
| `/wtf` | (nothing) | **FULL catch-up**: the flow map + all open work + what shipped recently. The everything button. |
| `/wtf fire` | a **skill** name (matches a `.claude/skills/` folder) | Deep-dive on that one command: what it does, when to use it, every way to run it, with a real example. |
| `/wtf today` | an **area** name (no folder matches) | Just that room's work: its open `[today]` items + its recent fixes. Scoped, not the firehose. |
| `/wtf since 2026-06-01` | the word `since` + a date | Only work that moved on/after that date. "What happened lately." |
| `/wtf <gibberish>` | matches nothing | I say "no skill or area called that", then list the real skill names + area tags so you can pick. |

That's the **complete** list. There is nothing else to remember. If unsure → just type `/wtf`.

---

## 📖 Where I read the truth from (I never guess from memory)

Every time you run `/wtf`, I **read these live** (with the Read/Grep tools, not from what I think I
remember — they may have changed while you were gone):

1. `.claude/skills/*/SKILL.md` — every command's real definition (name, what it does, args).
2. `.claude/skills/SKILLS_README.md` — the flow diagram + House rules (the shape of the system).
3. `context/roadmap.md` — the open queue: every app bug/idea/tech-debt, tagged `[area]`.
4. `.claude/skills/SKILLS_TODO.md` — the open *skills-system* queue (separate from the app).
5. `context/done-log.md` — the ledger: what you ASKED for + what SHIPPED (kept by `/inbox`+`/fire`).
6. `context/features/<area>.md` **Fix log** — per-room dated history (only when you scope to an area).

---

## 🪜 Steps — what I actually do

### `/wtf` (no argument) — the full catch-up
1. **Read** sources 1–5 above (live).
2. **Print, in this order, scannable (counts + one line per item):**
   - **🧭 Your flow** — the one-paragraph map: `/inbox` (dump ideas) → `/fire <area>` (build a room)
     → `/polish` (tidy before release). Plus the helpers list. So you remember *how you work*.
   - **🟢 Shipped recently** — from `done-log.md` SHIPPED blocks, newest first.
   - **🟡 Open — app** — unchecked `- [ ]` lines in `roadmap.md`, grouped by `[area]`.
   - **🔵 Open — skills/workflow** — unchecked lines in `SKILLS_TODO.md`.
   - **⚠️ Unaccounted** — anything ASKED in the ledger that's neither open nor shipped (so nothing
     silently vanishes).
3. **End with one nudge:** "Pick a room → `/fire <area>`. Forgot a command → `/wtf <command>`."

### `/wtf <skill>` — explain one command
Read that skill's `SKILL.md` and explain in plain words: what it does, *when to reach for it*, and
every command form with a real example. No folder matches that word? Say so, list the real names.

### `/wtf <area>` — catch up on one room
Filter the open work + the Fix log to that one `[area]` slug. Show its open items + its recent fixes.

### `/wtf since <date>` — recent only
Same as the full catch-up, but only ledger activity on/after `YYYY-MM-DD`.

---

## 📏 Rules
- **Read-only. ALWAYS.** `/wtf` never edits a file, never commits, never branches, never builds.
  It only *tells you what's going on*. To actually build → that's `/fire`.
- **Read live, never recite from memory.** Things changed while you were away — re-read the files.
- **Plain language over jargon.** This is the "explain it like I forgot everything" skill. If a
  monkey couldn't follow the output, it's too fancy — simplify.
- The output is a **map, not a plan** — don't start doing work, just show the lay of the land.

## 🚫 Not this skill's job
- Sorting a fresh brain-dump into the queue → `/inbox`.
- Building an area's items → `/fire <area> <branch>`.
- Pre-release hygiene → `/polish`.
- Auditing / scoring / critiquing the skills themselves → `/skill-doctor`.
- Authoring or eval-improving a skill → `skill-creator`.
