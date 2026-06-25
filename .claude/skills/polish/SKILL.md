---
name: polish
description: Pre-release hygiene pass — fix small mess AND drain structural tech-debt, in one
argument-hint: check | run
---

# /polish — clean + pay down debt before you ship

The pre-release pass — run when you're about to ship a version, **not** after every task. Folds the
old `/cleanup` + `/tech-debt`: first clear small mechanical mess, then drain the structural debt
queued in the roadmap.

> Follows the shared **House rules** (SKILLS_README → House rules): LSP-over-grep (STOP if LSP
> down) · never `any` · verify = tsc+lint once · auto-commit, no push/main.

## Modes — $ARGUMENTS

**`check`** (default) — **report + queue, no app-code changes.** Scan (LSP; grep only for raw text
like `console.log`/`TODO`). List findings split into ✅ **trivial** (auto-fixable) and 🧱
**structural** (consolidations / reorgs / lint-rule debt). Then **write every structural finding
into `context/roadmap.md` under 🧹 Reorg / tech debt** as a `- [ ]` TODO tagged `[area]`, deduped —
populating that queue is the whole job of `check`. Doc-only → **auto-commit on the current branch**
(no new branch), then report what was queued.

**`run`** — do the work in two phases. Cuts its own fresh branch first; auto-commits at the end.

### Phase 1 — small mess (janitor)
Scan and fix the trivial stuff: stray `console.log`/`warn` in `src/`; unused imports/vars; stale
`TODO`/`FIXME`/`@ts-ignore`/`eslint-disable` and any `any` (→ real type or `unknown`+narrowing);
orphaned files (confirm zero refs via LSP `findReferences` before deleting); leftover "Flutter"
references; `context/*.md` still matching reality; `.env` covering every var the code reads (never
print values). Report as a numbered list → ask which to fix (`1,3` / `all` / `none`) → fix only
those. Anything non-trivial → **file it** into the roadmap's 🧹 section and handle in Phase 2.

### Phase 2 — structural debt (drain the roadmap)
Work the **🧹 Reorg / tech debt** items — consolidations, folder reorgs, extracting a `packages/`
component, lint triage, scrubbing dead refs. Use LSP to make renames/moves/deletions safe. **One
focused item at a time**, each reviewable. After each: remove it from the roadmap, log a dated line
in the relevant feature doc's Fix log (or `current-feature.md` History if cross-cutting), commit.

## Verify
After the edits, run `tsc --noEmit` + lint **once** at the end of each phase (PowerShell + fnm).

## Not this skill's job
- Sorting fresh ideas → `/inbox` · Building an app area → `/fire <area>` · Open-vs-done → `/recall`.
