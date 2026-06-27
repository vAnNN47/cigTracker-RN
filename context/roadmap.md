# Roadmap — all open bugs & problems

Global list of everything open across the app. Each item is tagged by feature and,
where one exists, links to its doc in [features/](features/). When something is
fixed it moves to that feature's **Fix log** (with a date) and leaves this list.

> This is the single open queue. Add items by sorting a brain-dump with `/inbox`; build + clear
> an area's items with `/fire <area>` (it moves each done item to that area's Fix log). Drain the
> **🧹 Tech debt** section with `/polish`. **🔍 Audits** = skill-driven sweeps (render-perf,
> ui-design, rtl/a11y) that surface findings — run the named skill, then file the fixes it finds.


## 🐞 Bugs

_(none open)_

## 🧩 Improvements

- [ ] **[theme]** Dark mode redesign — keep it dark but more modern, in the spirit of Discord's dark background, with green as the primary color. (דארק מוד מודרני בסטייל דיסקורד, ירוק primary)

## 🔍 Audits

- [ ] **[perf]** Render-audit follow-ups (the store-subscription storm + Stats memoization are **done** — see [features/perf.md](features/perf.md)). Still open: (1) cross **`app-ui-design`** over the UI (sheets/drawers/screens) for design best-practice; (2) `purchases.tsx` history is an unbounded `ScrollView`+`.map` → `FlashList`/`SectionList` if histories get long; (3) `calendar.tsx` `renderMonth` scans all logs per cell × 42 cells × 3 month slots — memoize per-month if a profiler flags it on large data. (אודיט רינדור — הסטॉרm תוקן; נשאר ui-design + וירטואליזציה)

## 🧹 Tech debt

- [ ] **[styling]** Migrate styling from React Native `StyleSheet` → **NativeWind v5 (Tailwind v4 syntax)**, preserving the current design exactly. Big multi-screen refactor — staged on branch `nativewindv5_migration`. ⚠️ Reverses the current "No Tailwind/NativeWind" rule in `coding-standards.md` — update that standard as part of the migration. (See Expo's `expo:expo-tailwind-setup`.)
