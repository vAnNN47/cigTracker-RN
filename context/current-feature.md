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
- `/polish run` (2026-06-25, pass 2): **Phase 1** clean (no console.log/TODO/dead-Flutter/orphans; `.env` complete). **Phase 2** closed two structural items — (1) **PascalCase**: verified no stragglers (all `components/`+`auth/` PascalCase; `app/` routes lowercase per expo-router; kebab hook file allowed) → already-satisfied; (2) **Purged all `any`**: explicit row interfaces for the supabase/asyncStorage mappers, `parse<T>` returns `T`, googleAuth/auth-catch retyped via `unknown`-narrowing, `TabButton` inlined into `tabBarButton` with forwarded props cast to `ComponentProps<typeof Pressable>` (RN-vs-nav `ref` mismatch), then flipped `@typescript-eslint/no-explicit-any` → **error** in `eslint.config.js`. `tsc` clean; lint = 30 react-hooks errors only. Left open: JSDoc hover-docs, react-hooks triage.
- `/polish run` (2026-06-25, pass 2 cont.): **JSDoc hover-docs** — added one-line `/** */` above ~45 exported symbols that lacked a symbol-level doc (all `app/` screens + `(tabs)` + root/edit-log/purchases, every `components/` component, `auth/` views, the 3 repos + `createRepository`, both stores, `useStrings`, `supabase`, `googleAuth`, the `theme` tokens/`useColors`, and the undocumented `domain/logic` + `day` functions). Also fixed a misattached doc in `theme/index.ts` (palette comment sat above `useIsDark` but described `useColors` — split into one each). `tsc` clean; lint still 30 react-hooks only. Closes the JSDoc roadmap item. Left open: react-hooks triage.
- `/polish run` (2026-06-25, pass 2 cont.): **react-hooks triage** — cleared all 30 lint errors. (a) `react-hooks/refs`: replaced `useRef(new Animated.Value(x)).current` with `useState(() => new Animated.Value(x))` in `index.tsx` (pulse, scrollY) + `Toast.tsx` (opacity, translateY) — stable single instance, no ref read in render; and in `settings.tsx` moved the `formRef/limitRef` mirroring out of render into a `useEffect` (the unmount flush still reads latest committed drafts). (b) `set-state-in-effect`: converted the reset-on-change effects in `_layout.tsx` (dataMode → reset load flags), `AccountDrawer.tsx` + `MainDrawer.tsx` (drawer close → reset sub-panel) to React's render-time previous-value pattern (also drops a stale frame); dropped MainDrawer's now-unused `useEffect` import; rewrote `use-color-scheme.web.ts` to `useSyncExternalStore` with a `'light'` server snapshot (hydration-safe). **`tsc` clean, `npm run lint` clean (0 errors, 0 warnings).** ⚠️ Needs a device/web smoke-test (Today pulse + FAB-on-scroll, Toast, both drawers, theme) in RTL + LTR. Tech-debt queue now empty.
