# Roadmap — app open queue

Open app bugs / improvements / tech-debt, tagged `[area]`. Shipped items **leave** for the monthly
archive (`context/archive/YYYY/MM-month.md`); a drained section reads exactly `_(none open)_` — this is the
OPEN queue, not a tombstone wall.

> **Item format:** a **plain one-liner** anyone gets, then `—`, then the technical detail.
> How the flow works (`/inbox` → `/fire` → `/polish`) → `.claude/skills/SKILLS_README.md`.


## 🐞 Bugs


## 🧩 Improvements

- [ ] **[a11y]** **Crank the phone's text size right up and make sure nothing in the app gets cut off.** — Device-test large Dynamic Type / font scaling to 200% (WCAG 1.4.4); watch fixed-height rows (recent-log, calendar cells, stepper rows) for clipping. Contrast + screen-reader labels already shipped 2026-06-28. (Dynamic Type — בדיקת מכשיר)

- [ ] **[today]** **When the main counter is scrolled off screen, the + button should pop in (not just fade) and sit on the correct side — right in Hebrew, left in English.** — Replace the FAB's fade-in with a pop/scale appear animation when the hero counter isn't visible; place it start-side per direction (RTL right / LTR left). (כפתור + — פופ-אפ ובצד הנכון)
- [ ] **[today]** **Make the main counter feel tappable on its own — a subtle one-time hint animation each time you land on Today — and maybe drop the + badge from it.** — Consider removing the + affordance from the main counter and instead nudging it with a subtle one-shot animation on each Today entry so users learn it's pressable. (רמז שהקאונטר לחיץ — אנימציה עדינה)

## 🔍 Audits

_(none open)_

## 🧹 Tech debt

_(none open)_
