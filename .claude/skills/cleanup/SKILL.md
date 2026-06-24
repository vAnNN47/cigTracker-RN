---
name: cleanup
description: Find small mechanical mess — auto-fix the trivial, file the structural into roadmap.md
argument-hint: check | run
---

# /cleanup — the janitor (finds & files)

Scans for small, plain-English housekeeping mess. It **fixes the trivial** and
**files the structural** into `context/roadmap.md`. It does NOT do big refactors —
that's `/tech-debt`. (cleanup fills the roadmap, /tech-debt empties it.)

## What it scans
1. History in `context/current-feature.md` ordered oldest → newest.
2. Stray `console.log` / `console.warn` in `src/`.
3. Unused imports / variables.
4. Stale `TODO` / `FIXME`.
5. Orphaned/unused files (zero references).
6. Context files (`context/*.md`) still match reality.
7. `.env` has every var the code reads (via `expo-constants` / `app.config.js`); never print values.
8. Stale `@ts-ignore` / `eslint-disable`.
9. Leftover "Flutter" references (this app is fully React Native now).

## Modes — $ARGUMENTS

**`check`** (default): report only, change nothing. Split findings into:
- ✅ **trivial** — safe to auto-fix
- 🧱 **structural** — belongs in tech debt

**`run`**:
1. Report findings as a numbered list (trivial vs structural).
2. Ask which trivial items to fix (`1,3,5` / `all` / `none`); fix only those; re-run `npx tsc --noEmit`.
3. For every 🧱 structural finding, **add it to `context/roadmap.md`** under
   **🧹 Reorg / tech debt** (deduped — don't add one that's already listed). That's
   how the roadmap stays the single source of truth; `/tech-debt` then drains it.

## Boundary
- Trivial mess → cleanup fixes it.
- Structural debt → cleanup FILES it to roadmap.md; `/tech-debt` does the work.
- App features / bugs → `/feature`.
