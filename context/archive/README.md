# Archive — cold store for rolled-out ledger batches + the skills done-store

The append-only `context/done-log.md` ledger grows forever. To keep the **hot** file scannable,
old batches are **moved** here (never deleted) once the ledger crosses a size threshold.

This folder also holds **`skills-done.md`** — the skills "Fix log" (where `/skill-forge` files
shipped `SKILLS_TODO.md` items, keeping that queue **open-only** like `roadmap.md`). It's the skills
counterpart of a roadmap area's `context/features/<area>.md` Fix log; it is **not** size-gated and
does not roll per year — it just grows append-only.

## Format
- One file per year: **`done-log-<year>.md`** (e.g. `done-log-2026.md`).
- Each holds whole `ASKED` / `SHIPPED` blocks lifted verbatim from `done-log.md`, **newest on top**
  (same order as the live ledger). No reformatting — a block is the unit, moved intact.
- This folder is the **canonical cold store**. Hand-edit only to receive a roll; otherwise append-only.

## Who writes here
- **`/polish run`** (Phase 1 janitor, size-gated): when `done-log.md` exceeds ~150 lines, it offers
  to roll the **oldest** batches here until the hot file is back to a recent window (~newest 15
  batches / ~120 lines), leaving a pointer line in `done-log.md`.
- Nothing writes here per-session — archiving is a pre-release maintenance action, not automatic.

## Who reads here
- **`/wtf since <old-date>`** and the **⚠️ Unaccounted** reconcile read these files too, so archived
  work is never "vanished" — just out of the default recent view.

> Rule of thumb: **archive = move, never delete.** Commit history records what *shipped*; this ledger
> (live + archived) is the only record of what was **asked** + how it was categorized.
