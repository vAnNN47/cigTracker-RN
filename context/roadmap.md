# Roadmap — all open bugs & problems

Global list of everything open across the app. Each item is tagged by feature and,
where one exists, links to its doc in [features/](features/). When something is
fixed it moves to that feature's **Fix log** (with a date) and leaves this list.

> This is the single open queue. Add items by sorting a brain-dump with `/inbox`; build + clear
> an area's items with `/fire <area>` (it moves each done item to that area's Fix log). Drain the
> **🧹 Tech debt** section with `/polish`. **🔍 Audits** = skill-driven sweeps (render-perf,
> ui-design, rtl/a11y) that surface findings — run the named skill, then file the fixes it finds.


## 🐞 Bugs

- [ ] **[inputs]** On iOS, typing fast into a text field makes the cursor jump backwards — controlled-`TextInput` re-render resetting the caret. Reported broadly, so audit **every** controlled `TextInput` (edit-log comment/diary, add-smoke sheet, settings price/baseline). Likely fix: uncontrolled/defaultValue or stop the parent re-rendering per keystroke (stable handlers, Zustand selectors). Pairs with the render-audit skill. (כשכותבים מהר ב-iOS הסמן קופץ אחורה — קשור לרינדורים)

## 🧩 Improvements

- [ ] **[theme]** Dark mode redesign — keep it dark but more modern, in the spirit of Discord's dark background, with green as the primary color. (דארק מוד מודרני בסטייל דיסקורד, ירוק primary)

## 🔍 Audits

- [ ] **[perf]** Whole-app render audit — run **`expo-react-native-performance`** (the 42-rule Expo render/perf skill) across `src/` **and** `packages/` (keyboard-sheet, month-pager, number-pad, pull-refresh) to catch re-render storms, missing list virtualization, and absent memoization before they bite. Also cross **`app-ui-design`** over the UI (sheets/drawers/screens) for design best-practice. Goal: no "multiple rendering issues". Pairs with the **[inputs]** iOS cursor-jump bug (same render-storm root). (אודיט רינדור לכל האפליקציה — perf + ui-design skills מול הקוד והפקג'ים)

## 🧹 Tech debt

- [ ] **[styling]** Migrate styling from React Native `StyleSheet` → **NativeWind v5 (Tailwind v4 syntax)**, preserving the current design exactly. Big multi-screen refactor — staged on branch `nativewindv5_migration`. ⚠️ Reverses the current "No Tailwind/NativeWind" rule in `coding-standards.md` — update that standard as part of the migration. (See Expo's `expo:expo-tailwind-setup`.)
