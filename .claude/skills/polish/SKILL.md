---
name: polish
description: Pre-release hygiene pass — fix small mess AND drain structural tech-debt, in one
argument-hint: check | run
---

# /polish — clean + pay down debt before you ship

The pre-release pass. Run it when you've finished developing and are about to open the
iPhone/Android to test or cut a version — **not** after every task. It folds the old
`/cleanup` + `/tech-debt` into one sweep: first it clears **small mechanical mess**, then it
drains the **structural debt** queued in the roadmap.

## Modes — $ARGUMENTS

**`check`** (default) — report only, change nothing. List findings split into:
- ✅ **trivial** (auto-fixable mess)
- 🧱 **structural** (the 🧹 Reorg / tech debt items in the roadmap)

**`run`** — do the work, in two phases:

### Phase 1 — small mess (the janitor)
Scan and fix the trivial stuff:
1. Stray `console.log` / `console.warn` in `src/`.
2. Unused imports / variables.
3. Stale `TODO` / `FIXME`, `@ts-ignore`, `eslint-disable`, and any `any` / `as any` (replace with
   the real type, or `unknown`+narrowing — never leave `any`).
4. Orphaned/unused files (zero references) — confirm with the **LSP tool** (`findReferences`)
   when available before deleting; fall back to Grep.
5. Leftover "Flutter" references (this app is fully React Native now).
6. Context files (`context/*.md`) still match reality.
7. `.env` has every var the code reads (via `expo-constants` / `app.config.js`) — never print values.

Report findings as a numbered list; ask which to fix (`1,3,5` / `all` / `none`); fix only those.
Anything too big to be trivial → **file it** into `context/roadmap.md` under **🧹 Reorg / tech
debt** (deduped) and handle it in Phase 2, not inline.

### Phase 2 — structural debt (drain the roadmap)
Work the **🧹 Reorg / tech debt** items in `context/roadmap.md` — consolidations, folder reorgs,
extracting a `packages/` component, lint/rule triage, scrubbing dead references.
- Use the **LSP tool** when available (`findReferences` / `goToDefinition`) to make
  renames/moves/deletions safe and to confirm nothing references a thing before removing it.
- **One focused item at a time**, each kept reviewable.
- After each: **remove it from the roadmap** and log a dated line in the relevant feature doc's
  Fix log (or `context/current-feature.md` History if cross-cutting).
- Commit each on its own if asked — conventional message, **no AI attribution**.

## Verify
Make the edits, then run `npx tsc --noEmit` + `npm run lint` **once** at the end of each phase
(PowerShell + fnm — see CLAUDE.md). Don't typecheck after every file.

## Not this skill's job
- Sorting fresh ideas → `/inbox`.
- Building an app area's features/bugs → `/fire <area>`.
