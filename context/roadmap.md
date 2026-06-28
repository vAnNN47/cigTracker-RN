# Roadmap — app open queue

Open app bugs / improvements / tech-debt, tagged `[area]`. Shipped items **leave** for the monthly
archive (`context/archive/YYYY/MM-month.md`); a drained section reads exactly `_(none open)_` — this is the
OPEN queue, not a tombstone wall.

> **Item format:** a **plain one-liner** anyone gets, then `—`, then the technical detail.
> How the flow works (`/inbox` → `/fire` → `/polish`) → `.claude/skills/SKILLS_README.md`.


## 🐞 Bugs

- [ ] **[sheets]** **On the cigarette-log sheet, tapping "more details" shoots the sheet up under the phone's status-bar icons, and it then sits frozen — you can't scroll up to change the location tag (car / social / etc.).** — The add-cig sheet's expanded ("more details") state overshoots the top safe-area inset (renders under the status bar / notch) and is statically positioned with no scroll, so fields above the fold (location tags) are unreachable. Cap the expanded height below the top inset and make it scrollable/draggable so every field stays reachable. (השיט עולה מעל ה-status bar ותקוע סטטי — אי אפשר לגלול לתגיות מיקום)


## 🧩 Improvements



## 🔍 Audits

_(none open)_

## 🧹 Tech debt

_(none open)_
