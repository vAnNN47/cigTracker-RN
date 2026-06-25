---
name: skill-doctor
description: Audit the skill set itself — inventory, overlap/duplication, framing critique, and a /10 score per skill with opinions
argument-hint: audit | fix
---

# /skill-doctor — give the skills a checkup

Meta-skill that turns the lens on `.claude/skills/` itself. It **inventories** every skill, **flags
overlap / duplication**, and **critiques the framing** (frontmatter + prose) where something doesn't
sit right — with an opinion and a concrete suggested rewrite. Default mode is **read-only**; `fix`
applies the wording changes you approve.

> Follows the shared **House rules** (SKILLS_README → House rules): verify = the load-check below ·
> auto-commit, no push/main. (No `tsc`/app code here — this skill only touches `.claude/skills/*`.)

## Modes — $ARGUMENTS

**`audit`** (default) — **report only, change nothing.** Read every skill and print the three
sections below. Suggests rewrites inline but writes no files, no branch, no commit.

**`fix`** — apply approved reframings. Cuts its own fresh branch, presents the framing findings as a
numbered list → ask which to apply (`1,3` / `all` / `none`) → edit only those `SKILL.md` files →
auto-commit at the end (local branch only, never push/main). Touches `name`/`description`/
`argument-hint`/prose only — **never invents or deletes a skill's behavior**.

## Sources (read these)
1. `.claude/skills/*/SKILL.md` — every skill (frontmatter + body).
2. `.claude/skills/SKILLS_README.md` — the three-verb flow + House rules + signatures (the framing yardstick).
3. `.claude/skills/SKILLS_TODO.md` — open process items, so a flagged gap isn't already queued.

## Steps
1. **Read** all `SKILL.md` files (dedicated Read/Glob tools, not shell).
2. **Build the report** with three sections:
   - **📋 Inventory** — a table: skill · `description` one-liner · args · read-only/code-touching ·
     **score /10** (see Scoring below). Pull the line from frontmatter; if the body contradicts it,
     note the mismatch.
   - **♊ Overlap / duplication** — pairs or clusters whose jobs blur (e.g. two skills that both
     "list" or both "clean"). For each: what overlaps, and a verdict — *merge*, *keep-separate with a
     sharper boundary*, or *fine as-is*. Cross-check the "Not this skill's job" footers — if A says
     "not my job → B" but B doesn't reciprocate, flag the asymmetry.
   - **✍️ Framing critique** — per skill, where wording doesn't sit right: vague/duplicated
     `description`, `argument-hint` that risks the YAML-array trap (a value starting with `[` must be
     quoted — see README), `name` ≠ folder, drifted prose, missing "Not this skill's job" footer,
     or a tone/verb mismatch with the three-verb flow. Give an **opinion + a concrete suggested
     rewrite**, not just "could be clearer".
3. **Print** the report, scannable — counts per section, one finding per line.
4. **In `fix` mode only:** turn the ✍️ findings into the numbered approve-list, apply the picks,
   then run the load-check + auto-commit.

## Scoring (/10)
A **fast qualitative read-score** — not an empirical measurement (for that, escalate to
`/skill-creator`, which runs real evals + a trigger-rate optimizer; see below). Score each skill out
of 10 across five dimensions, ~2 pts each, then give a one-line justification + a verdict:

| Dimension | What earns the points |
|---|---|
| **Triggering** | `description` says *what it does* AND *when to fire*; pushy enough not to under-trigger |
| **Scope** | one clear job; a "Not this skill's job" footer that routes elsewhere |
| **Distinctness** | doesn't overlap a sibling (cross-ref the ♊ section) |
| **Framing** | tight prose, no drift, verb/tone matches the three-verb flow |
| **Frontmatter** | `name` = folder · `description`/`argument-hint` are strings · bracketed hint quoted |

End each with a **verdict**: 🟢 keep · 🟡 sharpen (cite the cheapest fix) · 🟠 merge → name the sibling ·
🔴 ditch (say why it doesn't earn its slot). Put the score in the 📋 Inventory table and repeat it on
the skill's ✍️ Framing line.

> **When a /10 isn't enough** — for a skill that matters and scores low on *Triggering*, hand it to
> `/skill-creator`: its description-optimizer measures the real trigger-rate over ~20 queries and
> iterates. skill-doctor's score is the cheap first pass that tells you *which* skill is worth that.

## Verify (fix mode)
No `tsc` — these are docs. The gate is: every edited `SKILL.md` still **loads** — `name` equals its
folder, `description`/`argument-hint` are strings, and any bracketed `argument-hint` is quoted.
Confirm by re-reading the frontmatter of each file you touched.

## Rules
- **`audit` is read-only** — no edits, no branch, no commit.
- **Suggest, don't silently rewrite** — even in `fix`, the user picks which framing changes land.
- **Wording only** — never change what a skill *does*; behavior/scope changes are the user's call,
  routed to `SKILLS_TODO.md`, not this skill.
- A duplication verdict is a *recommendation*. Acting on a merge is a separate, user-approved edit.

## Not this skill's job
- Routing app ideas → `/inbox` · building an area → `/fire` · app hygiene/tech-debt → `/polish`.
- Authoring a brand-new skill from scratch → that's `skill-creator` (skills.sh).
