# Today tab

**What / where:** Home screen — live count vs. the active daily limit shown as a progress **Ring**; one-tap log a cigarette; optional count-down display (remaining allowance vs. smoked count). Files: [src/app/(tabs)/index.tsx](../../src/app/(tabs)/index.tsx), [src/components/charts/Ring.tsx](../../src/components/charts/Ring.tsx).

## Gotchas / lessons

- The edit-log **Save is plain green TEXT, not a green-filled button** — so a spinner/content beside it must use `green.green`, NOT `green.onGreen`. `onGreen` is "content on a green fill" (white in light / near-black in dark) → on the screen background it renders invisible (white-on-white / dark-on-dark). AddSmokeSheet's button IS filled, so `onGreen` is correct there.
- Count-down display keys off `settings.countDown` (hero shows `left/limit` + "remaining" vs `count/limit` + "smoked").
