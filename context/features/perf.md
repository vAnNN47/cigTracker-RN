# Performance / render audit

**What / where:** whole-app render-perf hygiene across `src/` (esp. the 4 tab screens
`app/(tabs)/` + `app/settings.tsx` + `app/purchases.tsx`) and the reusable `packages/`
(keyboard-sheet, month-pager, number-pad, pull-refresh). Driven by the
`expo-react-native-performance` skill (42 rules) + `app-ui-design` for design best-practice.

## Done

- [x] Every screen subscribes to the store via a **selector** (`useShallow`), not the whole store — 2026-06-27

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

## Follow-ups (still open — see roadmap `[perf]`)
- `purchases.tsx` history is an unbounded `ScrollView` + `.map`; consider `FlashList`/`SectionList`
  if histories get long (`list-use-flashlist`).
- `calendar.tsx` `renderMonth` runs `countForDay`/`limitForDay` for 42 cells × 3 month slots, each
  scanning all logs — memoize per-month if it shows up on a profiler with large datasets.
