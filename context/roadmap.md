# Roadmap — app open queue

Open app bugs / improvements / tech-debt, tagged `[area]`. Shipped items **leave** for the monthly
archive (`context/archive/YYYY/MM-month.md`); a drained section reads exactly `_(none open)_` — this is the
OPEN queue, not a tombstone wall.

> **Item format:** a **plain one-liner** anyone gets, then `—`, then the technical detail.
> How the flow works (`/inbox` → `/fire` → `/polish`) → `.claude/skills/SKILLS_README.md`.


## 🐞 Bugs

_(none open)_

## 🧩 Improvements

- [ ] **[a11y]** **Make the app usable for blind / low-vision people and easier to tap — buttons should say their name out loud, status shouldn't be shown by color alone, and small buttons need to be big enough to hit.** — Accessibility pass (from the `app-ui-design` cross, 2026-06-27). (1) **Screen-reader labels** — only Today's hero + FAB have `accessibilityLabel`; every other icon-only `Pressable` (calendar month arrows, settings/purchases back, edit pencils, purchase delete, drawer toggles, tab-bar buttons) has none → VoiceOver/TalkBack read nothing. Add `accessibilityLabel` + `accessibilityRole="button"` (strings via `useStrings`). (2) **Color-alone status** — calendar day under/over is conveyed by green/red fill only (WCAG 1.4.1); add a shape/icon cue. (3) **Touch targets** — progress range chips + the 32×32 nav buttons are below 44×44pt; ensure size or `hitSlop` covers it. (4) Verify `textDim`/placeholder contrast ≥4.5:1 in both themes + test large Dynamic Type for clipping in fixed-height rows. (נגישות — תוויות קורא-מסך, סטטוס לא-רק-בצבע, יעדי מגע)

## 🔍 Audits

_(none open)_

## 🧹 Tech debt

_(none open)_
