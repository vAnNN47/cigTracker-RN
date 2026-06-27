# Archive — the one done-store

When a TODO item ships, its line **leaves the open queue and moves here.** This folder is the
**single** record of done work — there is no `done-log.md`, no per-area Fix log. One place, always.

## Format
- **One file per month:** `YYYY/MM-month.md` (e.g. `2026/06-june.md`) — grouped in year folders, month as zero-padded number + name so it sorts chronologically and reads human.
- Inside, newest **day** on top: a `## YYYY-MM-DD` header, then one line per item:
  `- [app][<area>] what shipped` or `- [skills][<slug>] what shipped`.
- 12 files a year, under one `YYYY/` folder. "What did I do in June?" → open `2026/06-june.md`. Old months you never touch.
- Append-only; **never delete**.

## Who writes here
- **`/fire`** — when it finishes a `roadmap.md` item, moves the line here as `[app][<area>] …`.
- **`/skill-forge`** — when it finishes a `SKILLS_TODO.md` item, moves the line here as `[skills][<slug>] …`.
- Both **remove** the line from its open queue in the same step — an item is in exactly one place.

## Who reads here
- **`/wtf`** — reads the newest month file for the "recently done" digest.
- You, when you want "what did I ship lately" — open the current month.

> Tracking lives **here, not in git.** Heavy branch-cutting makes `git log` a poor "what did I do"
> view, so this archive is the human record; git just stores code versions.
