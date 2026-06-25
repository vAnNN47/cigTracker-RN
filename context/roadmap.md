# Roadmap — all open bugs & problems

Global list of everything open across the app. Each item is tagged by feature and,
where one exists, links to its doc in [features/](features/). When something is
fixed it moves to that feature's **Fix log** (with a date) and leaves this list.

> This is the single open queue. Add items by sorting a brain-dump with `/inbox`; build + clear
> an area's items with `/fire <area>` (it moves each done item to that area's Fix log). Drain the
> **🧹 Reorg / tech debt** section with `/polish`.


## 🐞 Bugs

- [ ] **[edit-log]** Save/Cancel buttons in the edit-log header aren't aligned — both lean toward the start; they should sit parallel, each pinned to its own side. (ביטול/שמור בעריכת רישום לא מקבילים)
- [ ] **[slide-drawer]** When a drawer link expands the panel 70%→100%, the text re-flows in real time during the stretch. Should pre-compute the full-screen layout and render it that way from the start of the expansion. (דראוור: הטקסט מסתדר real-time במעבר ל-100%)
- [ ] **[slide-drawer]** Drawers can't be closed by horizontal drag. Main (70%) should close on a start→end drag; the account drawer (100%) should close on an end→start drag. (אין דראג אופקי לסגירה)

## 🧩 Improvements

- [ ] **[theme]** Dark mode redesign — keep it dark but more modern, in the spirit of Discord's dark background, with green as the primary color. (דארק מוד מודרני בסטייל דיסקורד, ירוק primary)

## 🧹 Reorg / tech debt

- [ ] **[styling]** Migrate styling from React Native `StyleSheet` → **NativeWind v5 (Tailwind v4 syntax)**, preserving the current design exactly. Big multi-screen refactor — staged on branch `nativewindv5_migration`. ⚠️ Reverses the current "No Tailwind/NativeWind" rule in `coding-standards.md` — update that standard as part of the migration. (See Expo's `expo:expo-tailwind-setup`.)
