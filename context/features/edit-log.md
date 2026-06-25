# Edit-log modal

**What / where:** Full-screen modal route to edit a today log's time, location, comment and diary — `src/app/edit-log.tsx`.

## Done

- [x] Header Save/Cancel actions sit parallel, each pinned to its own reading edge (RTL + LTR) — 2026-06-25

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-25 — Header Save/Cancel were aligned by two different mechanisms (Cancel: stretch + `textAlign: auto`; Save: `alignItems: "flex-end"`), so they didn't mirror and both leaned toward the start. Unified both on the codebase's RTL-safe `textAlign` swap: added a `textEnd` mirror of `textStart` in `src/i18n/rtl.ts`, dropped the `saveBtnWrap` wrapper, and pinned Cancel→`textStart` / Save→`textEnd` so each hugs its own edge in both directions.
