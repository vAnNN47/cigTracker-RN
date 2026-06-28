# Roadmap — app open queue

Open app bugs / improvements / tech-debt, tagged `[area]`. Shipped items **leave** for the monthly
archive (`context/archive/YYYY/MM-month.md`); a drained section reads exactly `_(none open)_` — this is the
OPEN queue, not a tombstone wall.

> **Item format:** a **plain one-liner** anyone gets, then `—`, then the technical detail.
> How the flow works (`/inbox` → `/fire` → `/polish`) → `.claude/skills/SKILLS_README.md`.


## 🐞 Bugs


## 🧩 Improvements

- [ ] **[a11y]** **Re-check big-text mode after the 1.4 scaling cap — confirm nothing still overlaps, and bump any screen that can take more.** — A global `maxFontSizeMultiplier: 1.4` clamp shipped 2026-06-28 (in `@/tw` Text). Device-re-test at max font (S9 / iOS) that hero, recent-log times, savings buttons, calendar cells, stepper rows no longer clip; if a body-text screen can safely allow more than 1.4 toward WCAG 200%, raise it there. (Dynamic Type — אימות אחרי clamp)


## 🔍 Audits

_(none open)_

## 🧹 Tech debt

_(none open)_
