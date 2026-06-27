# Performance / render audit

**What / where:** whole-app render-perf hygiene across `src/` (esp. the 4 tab screens
`app/(tabs)/` + `app/settings.tsx` + `app/purchases.tsx`) and the reusable `packages/`
(keyboard-sheet, month-pager, number-pad, pull-refresh). Driven by the
`expo-react-native-performance` skill (42 rules) + `app-ui-design` for design best-practice.

## Done

- [x] Every screen subscribes to the store via a **selector** (`useShallow`), not the whole store — 2026-06-27
- [x] Long history lists are virtualized; calendar grid looks up day counts O(1) — 2026-06-27

## Fix log

- 2026-06-27 — **Killed the render-storm root.** Five screens (`index`, `calendar`, `progress`,
  `purchases`, `settings`) called `useAppStore()` with no selector, so they subscribed to the
  *entire* store and re-rendered on **any** `set()` — a theme toggle, a locale change, or another
  tab's data write re-rendered every mounted tab (expo-router keeps tabs mounted). Switched each to
  `useAppStore(useShallow((st) => ({ …only the slices it reads })))`, so a screen re-renders only
  when its own data changes. This is the same render-storm that fed the `[inputs]` iOS caret bug.
- 2026-06-27 — **Memoized the expensive Stats series.** `progress.tsx` recomputed `dailyStats`,
  `savingsSeries`, and `hourlyHistogram` (each an O(logs) sweep) on every render; wrapped them in
  `useMemo` keyed on their real inputs (`logs`/`limits`/`settings`/`dsh`/`range`).

- 2026-06-27 — **`app-ui-design` cross-check done.** Surfaced findings (filed to roadmap, not fixed
  here): icon-only `Pressable`s lack `accessibilityLabel`/role (only Today's hero+FAB have them);
  calendar day status is color-alone (WCAG 1.4.1); a few sub-44pt touch targets → roadmap `[a11y]`.
  Error/status/shadow colors are hardcoded hex across ≥6 files (`#C0392B` in 4) → tech-debt `[theme]`
  token-extraction item.

- 2026-06-27 — **Virtualized the purchase history.** `purchases.tsx` rendered every row inside a
  `ScrollView` + nested `.map` (no recycling). Converted to a built-in **`SectionList`** (sections =
  day groups, day total in `renderSectionHeader`, grand total as `ListHeaderComponent`) — RN now
  recycles offscreen rows. Kept SectionList built-in rather than add `@shopify/flash-list` (no dep
  in the project; coding-standards prefers existing libs). Spacing preserved via a header top-margin
  since the per-group wrapper `View` is gone.
- 2026-06-27 — **Calendar grid no longer re-scans logs per cell.** `renderMonth` called
  `countForDay` (a filter+sort over all logs) for each of 42 cells × 3 month slots. Replaced with a
  single `useMemo` `Map<dayKey, count>` built in one pass over `logs`, looked up O(1) per cell.
  Selection/today highlighting stays in the (cheap) cell JSX, so tapping a day is unaffected.
