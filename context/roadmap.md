# Roadmap — all open bugs & problems

Global list of everything open across the app. Each item is tagged by feature and,
where one exists, links to its doc in [features/](features/). When something is
fixed it moves to that feature's **Fix log** (with a date) and leaves this list.

> This is the single open queue. Add items by sorting a brain-dump with `/inbox`; build + clear
> an area's items with `/fire <area>` (it moves each done item to that area's Fix log). Drain the
> **🧹 Reorg / tech debt** section with `/polish`.


## 🐞 Bugs

- [ ] **[sheets?]** On iOS, typing fast into a text field makes the cursor jump backwards — likely a controlled-`TextInput` re-render resetting the caret. ⚠️ Which field? (edit-log comment/diary, add-smoke sheet, or settings) — confirm before fixing. (כשכותבים מהר ב-iOS הסמן קופץ אחורה — קשור לרינדורים?)

## 🧩 Improvements

- [ ] **[theme]** Dark mode redesign — keep it dark but more modern, in the spirit of Discord's dark background, with green as the primary color. (דארק מוד מודרני בסטייל דיסקורד, ירוק primary)

## 🧹 Reorg / tech debt

- [ ] **[styling]** Migrate styling from React Native `StyleSheet` → **NativeWind v5 (Tailwind v4 syntax)**, preserving the current design exactly. Big multi-screen refactor — staged on branch `nativewindv5_migration`. ⚠️ Reverses the current "No Tailwind/NativeWind" rule in `coding-standards.md` — update that standard as part of the migration. (See Expo's `expo:expo-tailwind-setup`.)
