# Roadmap — app open queue

Open app bugs / improvements / tech-debt, tagged `[area]`. Shipped items **leave** for the monthly
archive (`context/archive/YYYY/MM-month.md`); a drained section reads exactly `_(none open)_` — this is the
OPEN queue, not a tombstone wall.

> **Item format:** a **plain one-liner** anyone gets, then `—`, then the technical detail.
> How the flow works (`/inbox` → `/fire` → `/polish`) → `.claude/skills/SKILLS_README.md`.


## 🐞 Bugs


## 🧩 Improvements

- [ ] **[a11y]** **In light mode the muted gray label text is a touch too faint to read comfortably.** — Residual from the 2026-06-28 a11y pass: light-theme `textDim` `#6C7B6D` measures ~4.1:1 on `bg` / ~4.3:1 on `card` — below WCAG AA 4.5:1 for normal (11–13px) text; placeholder inherits it. Darken light `textDim` to ≤ luminance 0.17 (≈ `#5E6B5F`) and re-check all light-theme `text-text-dim` uses. Dark theme already passes (5.8/4.9:1). Also device-test large Dynamic Type for clipping in fixed-height rows. (ניגודיות textDim בהיר + Dynamic Type)

- [ ] **[today]** **When the main counter is scrolled off screen, the + button should pop in (not just fade) and sit on the correct side — right in Hebrew, left in English.** — Replace the FAB's fade-in with a pop/scale appear animation when the hero counter isn't visible; place it start-side per direction (RTL right / LTR left). (כפתור + — פופ-אפ ובצד הנכון)
- [ ] **[today]** **Make the main counter feel tappable on its own — a subtle one-time hint animation each time you land on Today — and maybe drop the + badge from it.** — Consider removing the + affordance from the main counter and instead nudging it with a subtle one-shot animation on each Today entry so users learn it's pressable. (רמז שהקאונטר לחיץ — אנימציה עדינה)

## 🔍 Audits

_(none open)_

## 🧹 Tech debt

_(none open)_
