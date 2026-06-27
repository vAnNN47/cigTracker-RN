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

- [ ] **[styling]** **Change the way the app's styling is written (to Tailwind/NativeWind) without changing how anything looks — a big behind-the-scenes refactor.** — Migrate styling from React Native `StyleSheet` → **NativeWind v5 (Tailwind v4 syntax)**, preserving the current design exactly. Staged on branch `nativewindv5_migration_01`. **⏳ In progress** — setup + green-fill fix **done**; **17 of 20 screens converted** (pilot `community` + the 16 mechanical screens batch-migrated 2026-06-27, tsc/lint green + utilities compile-checked). Only the **3 special screens** (`progress` SVG, `index` Animated, `calendar` grid) + the FINAL cleanup remain. Device-eyeball pending on everything converted. Full cheatsheet/details in [features/styling.md](features/styling.md).

  **✅ Green-fill blocker RESOLVED (2026-06-27):** every themed `bg-*` rendered empty (looked green-specific only because the dark UI hid the missing card fills). Real cause: tokens used `light-dark()`, and metro runs react-native-css with `inlineVariables:false`, which **drops the dark branch of `light-dark()`** — compiling `global.css` showed ALL dark hex values ABSENT. (The earlier `--color-*: initial` palette theory was a red herring.) Fix: light palette in `@theme`, dark palette via `@media (prefers-color-scheme: dark)` var overrides; re-compiled → both branches survive. **Needs `expo start -c` to land on device.** Details in [features/styling.md](features/styling.md).

  **▶️ Run model — the 16 mechanical screens were batched in one run (2026-06-27) once the green-fill blocker was fixed; conversion is deterministic + gated by tsc/lint + a token compile-check, so only pixel-eyeball remains (batches into ONE device pass).** The **3 remaining special screens** (`progress`/`index`/`calendar`) carry real logic risk (SVG color props, Animated wrappers, heavy grid) → do those **one per run**. Device-verify (light+dark+RTL vs original) before final sign-off — `tsc`+`lint` can't see pixels.

  **Per-screen steps:** (1) read the target's `StyleSheet`, keep original open to diff. (2) swap RN imports → `@/tw` (`View/Text/ScrollView/Pressable/TextInput`), `Image`→`@/tw/image`, `Animated.View`→`@/tw/animated`; **keep `useColors()`** for icon/SVG `color` props + non-CSS elements (`SafeAreaView` bg). (3) map styles → className (tokens: `text-text`/`text-text-dim`, `bg-card`/`bg-card-soft`/`bg-green`, `border border-border`, `font-bold`/`font-medium`/`font-semibold`/`font-regular`, `rounded-card`/`rounded-pill`/`rounded-button`; spacing rides Tailwind's 4px step `xs→1 … xxl→6`; use arbitrary `text-[15px]`/`leading-[21px]`/`rounded-[19px]`/`tracking-[1.2px]` for off-scale numbers). (4) **RTL:** keep `style={{ textAlign: textStart }}` inline (no direction-aware class); `flex-row` auto-flips. (5) lazy-load any native module a stale dev build lacks (see `src/lib/clipboard.ts`). (6) `tsc`+`lint`, then device-verify.

  **Screens to migrate (run order):**
  - [x] `src/app/(tabs)/community.tsx` — pilot; green-fill blocker fixed (2026-06-27); user device-eyeball left
  - [x] `src/app/_layout.tsx` (2) — batch 2026-06-27 ⚠️ device-eyeball pending
  - [x] `src/auth/SplashView.tsx` (2) — batch (kept light-only) ⚠️
  - [x] `src/components/ui/TabHeader.tsx` (3) — batch ⚠️
  - [x] `src/components/feedback/Toast.tsx` (5 — **RN** Animated, NOT `@/tw/animated`) — batch ⚠️
  - [x] `src/auth/LegalFooter.tsx` (8) — batch ⚠️
  - [x] `src/auth/LoginView.tsx` (9) — batch ⚠️
  - [x] `src/auth/OnboardingView.tsx` (11) — batch ⚠️
  - [x] `src/app/purchases.tsx` (15 — SectionList stays RN) — batch ⚠️
  - [x] `src/components/sheets/AddPurchaseSheet.tsx` (15) — batch ⚠️
  - [x] `src/components/drawers/MainDrawer.tsx` (18) — batch ⚠️
  - [x] `src/auth/WelcomeView.tsx` (21) — batch ⚠️
  - [x] `src/components/sheets/LogDetailSheet.tsx` (22) — batch ⚠️
  - [x] `src/app/edit-log.tsx` (24) — batch ⚠️
  - [x] `src/app/settings.tsx` (27) — batch ⚠️
  - [x] `src/components/sheets/AddSmokeSheet.tsx` (27 — `SheetTextInput` input style stays inline) — batch ⚠️
  - [x] `src/components/drawers/AccountDrawer.tsx` (28 — hairline dividers inline) — batch ⚠️
  - [ ] `src/app/(tabs)/progress.tsx` (29 — SVG charts; colors stay via `useColors`)
  - [ ] `src/app/(tabs)/index.tsx` (41 — Today: Ring/FAB/pulse Animated)
  - [ ] `src/app/(tabs)/calendar.tsx` (43 — heaviest, day grid)
  - [ ] **FINAL:** retire `src/theme`'s `makeUseStyles` (keep `useColors`), then flip the "No Tailwind/NativeWind, `StyleSheet` only" rule in **`coding-standards.md`**, **`CLAUDE.md`**, **`project-overview.md`** (skills defer to `coding-standards.md`, so they follow automatically — verify none names `StyleSheet` after).

  ⚠️ **Version note:** the `expo:expo-tailwind-setup` skill pins `react-native-css@0.0.0-nightly.5ce6396` + `nativewind@5.0.0-preview.2`, which peer on **Expo 54** — wrong for SDK 56; use `react-native-css@^3.0.1` + `nativewind@5.0.0-preview.4` (done on the branch).
