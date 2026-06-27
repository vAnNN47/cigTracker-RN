# Roadmap — all open bugs & problems

Global list of everything open across the app. Each item is tagged by feature and,
where one exists, links to its doc in [features/](features/). When something is
fixed it moves to that feature's **Fix log** (with a date) and leaves this list.

> **Every item leads with a plain one-liner** — a **bold, jargon-free sentence a non-technical
> person understands** ("what is this, in human words?"), then an em-dash, then the technical
> detail. No item is just a wall of code-speak.

> This is the open queue for **app** work. (Skills/workflow-system tweaks have their own queue —
> `.claude/skills/SKILLS_TODO.md`, drained by `/skill-forge`; `/inbox` routes each item to the
> right one.) Add items by sorting a brain-dump with `/inbox`; build + clear an area's items with
> `/fire <area>` (it moves each done item to that area's Fix log + the `done-log.md` ledger, and the
> item leaves this list). Drain the **🧹 Tech debt** section with `/polish`. **🔍 Audits** =
> skill-driven sweeps (render-perf, ui-design, rtl/a11y) that surface findings — run the named
> skill, then file the fixes it finds.


## 🐞 Bugs

_(none open)_

## 🧩 Improvements

- [ ] **[a11y]** **Make the app usable for blind / low-vision people and easier to tap — buttons should say their name out loud, status shouldn't be shown by color alone, and small buttons need to be big enough to hit.** — Accessibility pass (from the `app-ui-design` cross, 2026-06-27). (1) **Screen-reader labels** — only Today's hero + FAB have `accessibilityLabel`; every other icon-only `Pressable` (calendar month arrows, settings/purchases back, edit pencils, purchase delete, drawer toggles, tab-bar buttons) has none → VoiceOver/TalkBack read nothing. Add `accessibilityLabel` + `accessibilityRole="button"` (strings via `useStrings`). (2) **Color-alone status** — calendar day under/over is conveyed by green/red fill only (WCAG 1.4.1); add a shape/icon cue. (3) **Touch targets** — progress range chips + the 32×32 nav buttons are below 44×44pt; ensure size or `hitSlop` covers it. (4) Verify `textDim`/placeholder contrast ≥4.5:1 in both themes + test large Dynamic Type for clipping in fixed-height rows. (נגישות — תוויות קורא-מסך, סטטוס לא-רק-בצבע, יעדי מגע)

- [ ] **[sheets]** **When you "copy" a cigarette log, just put its text on the clipboard with a little "Copied" popup — don't pop open the OS share menu.** — Log copy action: make it a **plain clipboard copy**, not the OS share sheet. `LogDetailSheet`'s `copyAll` calls `Share.share(...)`; replace with `Clipboard.setStringAsync(...)` + a native snackbar/toast "Copied to clipboard" (`useStrings`, both themes/RTL). Copied text = the log's **comment + diary note only** (drop the `cigNumber · time` header line that's all it effectively yields today). (קופי טקסט — העתקה ללוח + סנאקבר, לא share)

## 🔍 Audits

_(none open — render audit drained; `app-ui-design` findings live as `[a11y]`; the `[theme]` redesign + token items shipped 2026-06-27)_

## 🧹 Tech debt

- [ ] **[styling]** **Change the way the app's styling is written (to Tailwind/NativeWind) without changing how anything looks — a big behind-the-scenes refactor.** — Migrate styling from React Native `StyleSheet` → **NativeWind v5 (Tailwind v4 syntax)**, preserving the current design exactly. Big multi-screen refactor — staged on branch `nativewindv5_migration`. ⚠️ **This flips a project-wide rule, so the migration must also rewrite every place that rule is written** — the "No Tailwind/NativeWind, `StyleSheet` only" wording lives in **`coding-standards.md` (Styling), `CLAUDE.md` (theme section), and `project-overview.md` (tech-stack table)** — all three must change to "NativeWind/Tailwind" in the same migration. The **skills** (`/fire`, `/polish`, `/package`) don't hardcode the styling rule — they defer to `coding-standards.md` as canonical — so once that doc flips, the skills enforce Tailwind automatically (verify no skill mentions `StyleSheet` directly after). **Net: after migration, all rules + all skills follow Tailwind, not `StyleSheet`.** (See Expo's `expo:expo-tailwind-setup`.)
