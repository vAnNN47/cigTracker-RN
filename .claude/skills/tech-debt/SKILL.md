---
name: tech-debt
description: Work through the structural tech-debt backlog in roadmap.md — one item, implemented and ticked off
argument-hint: list | next | <item text>
---

# /tech-debt — execute the structural backlog

Where `/cleanup` *finds* mess and *files* it, `/tech-debt` *fixes* the bigger,
**structural** items — the work that "wraps around the app": consolidations, folder
reorgs, extracting a reusable `packages/` component, lint/rule triage, scrubbing dead
references. These live in `context/roadmap.md` under **🧹 Reorg / tech debt**.

## Usage

| Command | What it does |
|---------|--------------|
| `/tech-debt list` | Show the open tech-debt items from `context/roadmap.md`. |
| `/tech-debt next` | Pick the top / safest item and implement it. |
| `/tech-debt <item text>` | Implement the matching item. |

## Steps (per item)

1. Read the item from `context/roadmap.md` (**🧹 Reorg / tech debt** section).
2. Implement it as a **single focused change**. Keep `npx tsc --noEmit` passing
   (use PowerShell + fnm — see CLAUDE.md).
3. When green: **remove the item from roadmap.md**, and log a dated line in the
   relevant feature doc's Fix log (or `context/current-feature.md` History if it's
   cross-cutting).
4. Commit it on its own — conventional message, **no AI attribution** (see ai-interaction.md).
5. **One item per run** unless told otherwise — big refactors must stay reviewable.

## Not this skill's job
- Small mechanical mess (console.logs, unused imports, orphan files) → `/cleanup`.
- App features / bug fixes → `/feature` + normal work.
