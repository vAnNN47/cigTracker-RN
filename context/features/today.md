# Today tab

**What / where:** Home screen — live count vs. the active daily limit shown as a progress **Ring**; one-tap log a cigarette; optional count-down display (remaining allowance vs. smoked count). Files: [src/app/(tabs)/index.tsx](../../src/app/(tabs)/index.tsx), [src/components/charts/Ring.tsx](../../src/components/charts/Ring.tsx).

## Gotchas / lessons

- The edit-log **Save is plain green TEXT, not a green-filled button** — so a spinner/content beside it must use `green.green`, NOT `green.onGreen`. `onGreen` is "content on a green fill" (white in light / near-black in dark) → on the screen background it renders invisible (white-on-white / dark-on-dark). AddSmokeSheet's button IS filled, so `onGreen` is correct there.
- Count-down display keys off `settings.countDown` (hero shows `left/limit` + "remaining" vs `count/limit` + "smoked").
- **Reanimated shared-value mutation trips `react-hooks/immutability` inside `useCallback`.** Writing `sv.value = …` where `sv` was passed as a `useCallback` dependency errors with *"value passed as a hook argument cannot be modified."* The same write inside a plain `useEffect` is fine. So the hero's per-focus hint uses `useNavigation().addListener("focus", run)` inside a `useEffect` (+ one mount `run()`), **not** `useFocusEffect(useCallback(…))`.
- **Hero counter has no `+` badge** — tappability is taught by a one-shot "pop" on each Today entry plus the "tap to log" hint text. Don't re-add a `+` affordance to the circle.
- **Over-limit cue** (`count > limit`): red number (`text-over-text`), red ring border (`overBorder`), and a `bg-over-bg` pill spelling out `overLimit(N)` — the pill is the non-color cue (WCAG 1.4.1). Count-down still floors remaining at 0 (no negatives, by design).
- **FAB** pops in via `withSpring` on a `fabAppear` shared value gated by `fabShown` (`y > 300`), on the **start** edge (`start: 22`) → RTL right / LTR left.
