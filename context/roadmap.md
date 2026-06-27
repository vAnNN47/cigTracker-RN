# Roadmap — app open queue

Open app bugs / improvements / tech-debt, tagged `[area]`. Shipped items **leave** for the monthly
archive (`context/archive/YYYY/MM-month.md`); a drained section reads exactly `_(none open)_` — this is the
OPEN queue, not a tombstone wall.

> **Item format:** a **plain one-liner** anyone gets, then `—`, then the technical detail.
> How the flow works (`/inbox` → `/fire` → `/polish`) → `.claude/skills/SKILLS_README.md`.


## 🐞 Bugs

- [ ] **[edit-log]** **The clock on the edit-cigarette screen is also pushed too far right.** — Same time-picker RTL misalignment as the add-smoke detail, on the edit screen. (שעון במסך עריכה — ימינה מדי)
- [ ] **[inputs]** **Copying text from the edit screen threw a "can't find native module" error — but works fine in the release build, so watch it.** — Clipboard copy raised a "cannot find native (expo)" exception in dev; verified working in the release build. Keep as a watch item — confirm it stays fixed, then archive. (העתקת טקסט ממסך עריכה — דב-אונלי?)
- [ ] **[edit-log]** **When a late-logged cigarette has a note, the note text doesn't line up with the time next to it.** — On the edit screen, the comment/note text isn't aligned against the time (`align` off). Check the row alignment for the note-vs-time layout. (הערה לא מיושרת מול השעה)

## 🧩 Improvements

- [ ] **[a11y]** **Make the app usable for blind / low-vision people and easier to tap — buttons should say their name out loud, status shouldn't be shown by color alone, and small buttons need to be big enough to hit.** — Accessibility pass (from the `app-ui-design` cross, 2026-06-27). (1) **Screen-reader labels** — only Today's hero + FAB have `accessibilityLabel`; every other icon-only `Pressable` (calendar month arrows, settings/purchases back, edit pencils, purchase delete, drawer toggles, tab-bar buttons) has none → VoiceOver/TalkBack read nothing. Add `accessibilityLabel` + `accessibilityRole="button"` (strings via `useStrings`). (2) **Color-alone status** — calendar day under/over is conveyed by green/red fill only (WCAG 1.4.1); add a shape/icon cue. (3) **Touch targets** — progress range chips + the 32×32 nav buttons are below 44×44pt; ensure size or `hitSlop` covers it. (4) Verify `textDim`/placeholder contrast ≥4.5:1 in both themes + test large Dynamic Type for clipping in fixed-height rows. (נגישות — תוויות קורא-מסך, סטטוס לא-רק-בצבע, יעדי מגע)

- [ ] **[today]** **When the main counter is scrolled off screen, the + button should pop in (not just fade) and sit on the correct side — right in Hebrew, left in English.** — Replace the FAB's fade-in with a pop/scale appear animation when the hero counter isn't visible; place it start-side per direction (RTL right / LTR left). (כפתור + — פופ-אפ ובצד הנכון)
- [ ] **[today]** **Make the main counter feel tappable on its own — a subtle one-time hint animation each time you land on Today — and maybe drop the + badge from it.** — Consider removing the + affordance from the main counter and instead nudging it with a subtle one-shot animation on each Today entry so users learn it's pressable. (רמז שהקאונטר לחיץ — אנימציה עדינה)

## 🔍 Audits

_(none open)_

## 🧹 Tech debt

_(none open)_
