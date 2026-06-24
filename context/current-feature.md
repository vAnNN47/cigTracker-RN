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
