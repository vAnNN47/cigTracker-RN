# Roadmap — all open bugs & problems

Global list of everything open across the app. Each item is tagged by feature and,
where one exists, links to its doc in [features/](features/). When something is
fixed it moves to that feature's **Fix log** (with a date) and leaves this list.

> Add items with `/feature <name> todo <text>`; clear them with `/feature <name> fix <text>`.

## 🐞 Bugs

- [ ] **[today / diary]** Missing save spinner when editing a log from Today/Diary → [features/today.md](features/today.md)
- [ ] **[sheets]** More padding needed on bottom-sheet Save/Cancel buttons

## 🧩 Improvements

- [ ] **[drawers]** SlideDrawer 70% ↔ 100% snap behaviour — extract to `packages/slide-drawer` so a list tap expands the existing drawer to 100% from its own side (RTL→right, LTR→left)

## 🧹 Reorg / tech debt (current focus)

- [ ] **Reorganize the folder structure** to a clear medium-app layout — group `src/components/` by purpose, confirm `src/` layering stays feature-scoped, then write the agreed structure into `coding-standards.md`. (The `components/` subfoldering, theme-merge, and PascalCase items below are its concrete sub-steps.)
- [ ] Scrub Flutter-origin references from comments (~15 files: store, models, domain, i18n, data, auth, Toast, Ring)
- [ ] Consolidate the two theme token files (`constants/theme.ts` + `theme/index.ts`) into one
- [ ] Reorganize `src/components/` into subfolders (ui / charts / sheets / drawers / feedback)
- [ ] Standardize component files on PascalCase
- [ ] Add one-line JSDoc hover-docs to exported components/functions
- [ ] Triage 38 lint errors from the new React-19/RN-0.85 react-hooks rules (`react-hooks/refs`, `react-hooks/set-state-in-effect`)
