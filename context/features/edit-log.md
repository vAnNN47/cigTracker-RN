# Edit-log modal

**What / where:** Full-screen modal route to edit a today log's time, location, comment and diary — [src/app/edit-log.tsx](../../src/app/edit-log.tsx).

## Gotchas / lessons

- Header **Save/Cancel** mirror via the RTL-safe `textAlign` swap (`textStart`/`textEnd` in `src/i18n/rtl.ts`), each pinned to its own reading edge — NOT `alignItems`/wrapper tricks (those don't mirror; both drift toward start). Cancel→`textStart`, Save→`textEnd`.
