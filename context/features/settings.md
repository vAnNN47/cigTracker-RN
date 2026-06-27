# Settings screen

**What / where:** Currency, price/pack, baseline/day, day-start hour, count-down toggle, language. Stepper writes are debounced (instant draft, persist after idle, flush on unmount). Persists through the store → repository. Files: [src/app/settings.tsx](../../src/app/settings.tsx) (also rendered as a panel inside the account drawer), writes via `useAppStore.saveSettings`.

## Gotchas / lessons

- Settings renders **twice** — as the `/settings` route AND as a panel in the account drawer (takes `onClose`). A change must work in both mounts.
- Adding a settings field needs persistence in **both** modes: local is automatic, but Supabase needs a matching `profiles` column + an upsert in `SupabaseRepository.saveSettings` (e.g. count-down needed a `count_down` column added via SQL).
- Stepper writes are debounced (instant draft → persist after idle → flush on unmount) — don't assume a write hits the repo synchronously.
