# Settings screen

**What / where:** Currency, price/pack, baseline/day, day-start hour, count-down toggle, language. Stepper writes are debounced (instant draft, persist after idle, flush on unmount). Persists through the store → repository. Files: [src/app/settings.tsx](../../src/app/settings.tsx) (also rendered as a panel inside the account drawer), writes via `useAppStore.saveSettings`.

## Done

- [x] Debounced stepper writes (instant draft state, persist after short idle, flush pending on unmount) — existing
- [x] Settings renders both as `/settings` route and as a drawer panel (takes `onClose`) — existing
- [x] Count-down toggle persists in **both** local and Supabase modes — 2026-06-24

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-24 — Count-down now persists in Supabase: added `count_down: settings.countDown` to the `profiles` upsert in `SupabaseRepository.saveSettings` (DB column added via SQL). Local mode already persisted it. `tsc` clean.
