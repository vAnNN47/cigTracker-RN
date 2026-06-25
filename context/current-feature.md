# Current Feature: Codebase reorganization & context system

## Status

<!-- Not Started | In Progress | Complete -->

In Progress

## Goals

<!-- Goals & requirements -->

- Remove dead Expo-template files and all leftover Flutter references.
- Consolidate the two theme token files (`constants/theme.ts` + `theme/index.ts`) into one.
- Reorganize `src/components/` into purpose-based subfolders (ui / charts / sheets / drawers / feedback).
- Standardize on PascalCase for component files.
- Add one-line JSDoc hover-docs to exported components/functions.
- Establish the `context/` system (per-feature docs + global `roadmap.md`) + `.claude/skills/` (feature, cleanup, list-components).

## Notes

<!-- Any extra notes -->

- Do small, reviewable commits (one concern each); typecheck (`npx tsc --noEmit`) after each.
- Queued bugs/tasks now live in [roadmap.md](roadmap.md); per-area detail in [features/](features/) (e.g. the count-down persistence bug is written up in [features/settings.md](features/settings.md)).

## History

<!-- Keep updated, earliest to latest -->

- Removed 8 unused Expo-template components (external-link, web-badge, ui/collapsible, animated-icon + .web + .module.css, hint-row, RefreshableScrollView shim). 420 lines deleted; `tsc --noEmit` clean.
- Built then simplified the context/skills system (2026-06-24): dropped the `research` skill and the feature `actions/` lifecycle; switched to per-feature docs (`context/features/*.md`) + global `roadmap.md`; kept `/feature`, `/cleanup`, `/list-components`; added `.claude/skills/SKILLS_README.md`.
- Added `/tech-debt` skill + clarified `/cleanup` (janitor files structural findings to roadmap; tech-debt drains them). First tech-debt item done: removed 3 orphan components (themed-text, themed-view, EditLogSheet — commit 0b41111, tsc clean). (2026-06-24)
- Consolidated the skills to a 3-verb flow (2026-06-25): `/triage`→**`/inbox`** (intake), `/feature start`+build+`fix` fused into **`/fire <area>`** (branch → build → verify-once → log fix), `/cleanup`+`/tech-debt` merged into **`/polish`** (pre-release). Made `roadmap.md` the single open queue; feature docs now hold context + Fix log only (no Open section). Helpers `/package` + `/list-components` unchanged. Updated SKILLS_README/TUTORIAL, CLAUDE.md, ai-interaction.md, context/README.md, _template.md.
- Merged the stacked feature branches down to the parent (2026-06-25): `slide-drawer`, `today` (edit-log spinner), then `polish` (which carried `sheets` padding + `skills-config`). No conflicts; edit-log.tsx cleanly took both the spinner fix and the header padding. Parent: `tsc` clean, 30 lint errors (react-hooks, deferred), 0 warnings.
- Folder reorg (2026-06-25, commit 6671902): grouped `src/components/` into `ui/ charts/ sheets/ drawers/ feedback/` and updated all importers to `@/components/<bucket>/<Name>`; documented the layout in `coding-standards.md`. `src/` top-level left as-is (already feature-scoped). Closes the "reorganize folder structure" + "components subfolders" roadmap items.
- `/polish run` (2026-06-25): **Phase 1** removed 14 stale `eslint-disable @typescript-eslint/no-explicit-any` directives + 3 unused imports (lint warnings 17→0; commit 29ba7e2). **Phase 2 (mechanical)** — scrubbed Flutter "ported from lib/*.dart" notes from 14 header comments (commit 6890628), and consolidated the theme into one source by deleting the orphaned Expo-template `src/constants/theme.ts` + its only (unused) consumer `src/hooks/use-theme.ts` (commit 9c1afb9). `tsc` clean; remaining lint = 38 `react-hooks` errors (still queued). Left open: folder reorg, components/ subfolders, PascalCase, JSDoc, react-hooks triage.
