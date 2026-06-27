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

## 🔍 Audits

_(none open — render audit drained; `app-ui-design` findings live as `[a11y]`; the `[theme]` redesign + token items shipped 2026-06-27)_

## 🧹 Tech debt

- [ ] **[styling]** **Change the way the app's styling is written (to Tailwind/NativeWind) without changing how anything looks — a big behind-the-scenes refactor.** — Migrate styling from React Native `StyleSheet` → **NativeWind v5 (Tailwind v4 syntax)**, preserving the current design exactly. Big multi-screen refactor — staged on branch `nativewindv5_migration_01`. **⏳ In progress** — setup + token map + `src/tw/` wrappers + color-scheme bridge **done**; pilot `community.tsx` converted (tsc/lint green) but **device-verify pending — green `bg-*` fills not painting, must root-cause first** (see Known issues in [features/styling.md](features/styling.md)). **Run model: ONE screen per `/fire styling` run** — take the next unchecked screen from the **Migration queue** in `features/styling.md` (simplest→hardest), follow the **Per-screen procedure** there, then the user device-verifies it (light+dark+RTL vs original) before it's ticked. **Remaining:** the green-fill blocker, then the other **19** screens + the FINAL step (retire `makeUseStyles`, flip the project-wide rule). ⚠️ **The rule-flip is part of the cutover, not yet done** — the "No Tailwind/NativeWind, `StyleSheet` only" wording lives in **`coding-standards.md` (Styling), `CLAUDE.md` (theme section), and `project-overview.md` (tech-stack table)** — all three change to "NativeWind/Tailwind" once every screen is migrated. The **skills** (`/fire`, `/polish`, `/package`) defer to `coding-standards.md` as canonical, so flipping that doc flips the skills automatically (verify no skill mentions `StyleSheet` directly after). ⚠️ **Version note:** the `expo:expo-tailwind-setup` skill pins `react-native-css@0.0.0-nightly.5ce6396` + `nativewind@5.0.0-preview.2`, which peer on **Expo 54** — wrong for our SDK 56; use `react-native-css@^3.0.1` + `nativewind@5.0.0-preview.4` (done on the branch).
