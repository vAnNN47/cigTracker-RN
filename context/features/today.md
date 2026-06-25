# Today tab

**What / where:** Home screen — live count vs. the active daily limit shown as a progress **Ring**; one-tap log a cigarette; optional count-down display (remaining allowance vs. smoked count). Files: [src/app/(tabs)/index.tsx](../../src/app/(tabs)/index.tsx), [src/components/Ring.tsx](../../src/components/Ring.tsx).

## Done

- [x] Count-down display wired to `settings.countDown` (hero shows `left/limit` and "remaining" vs `count/limit` and "smoked") — existing
- [x] Edit-log save shows a *visible* spinner while persisting (matters on Supabase, ~1.5s saves) — 2026-06-25

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-25 — Fixed the "missing" save spinner when editing a log from Today/Diary. The `ActivityIndicator` in the `/edit-log` modal ([src/app/edit-log.tsx](../../src/app/edit-log.tsx)) was rendered but **invisible in both themes**: it used `green.onGreen` ("content on a green fill" — `#FFF` light / near-black dark) on the light/dark *screen* background (the Save here is plain green text, not a green-filled button), so white-on-white / dark-on-dark. Switched it to `green.green` (same token as the Save text), now visible during the ~1.5s Supabase save. AddSmokeSheet was already correct (its button is green-filled, so `onGreen` is right there).
