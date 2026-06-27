# Performance / render audit

**What / where:** whole-app render-perf hygiene across `src/` (esp. the 4 tab screens `app/(tabs)/` + `app/settings.tsx` + `app/purchases.tsx`) and the reusable `packages/` (keyboard-sheet, month-pager, number-pad, pull-refresh). Driven by the `expo-react-native-performance` skill (42 rules) + `app-ui-design` for design best-practice.

## Gotchas / lessons

- **Always subscribe the store via a `useShallow` selector**, never bare `useAppStore()`. expo-router keeps every tab mounted, so a no-selector subscription re-renders **all** tabs on ANY `set()` (theme toggle, locale, another tab's write) — this render-storm also fed the `[inputs]` iOS caret bug.
- Heavy derived series must be `useMemo`'d on their real inputs (`progress.tsx` `dailyStats`/`savingsSeries`/`hourlyHistogram`, each an O(logs) sweep).
- Long lists virtualized — `purchases` uses a built-in **`SectionList`** (no FlashList dep; coding-standards prefers existing libs). `calendar` grid uses one `useMemo` `Map<dayKey,count>` (O(1) per cell) instead of a per-cell filter+sort over all logs.
