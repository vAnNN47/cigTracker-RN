# Styling — NativeWind v5 migration

**What / where:** The app-wide styling system. Today it's React Native `StyleSheet` +
theme tokens (`makeUseStyles`/`useColors`, `src/theme/index.ts`). The `[styling]` roadmap
item migrates it to **NativeWind v5 / Tailwind v4** (`react-native-css`), pixel-identical,
staged on branch `nativewindv5_migration_01`. Tokens are ported to CSS in
[src/global.css](../../src/global.css); CSS-enabled component wrappers live in
[src/tw/](../../src/tw/).

## Done

- [x] NativeWind v5 / Tailwind v4 setup — deps, metro/postcss, token map, `tw` wrappers, color-scheme bridge — 2026-06-27
- [x] Pilot screen converted: `community.tsx` (StyleSheet → className), gate green — 2026-06-27

## How it's wired (so the next screens follow the same pattern)

- **Deps (SDK 56-correct):** `nativewind@5.0.0-preview.4`, `react-native-css@^3.0.1`,
  `tailwindcss@^4`, `@tailwindcss/postcss`, `tailwind-merge`, `clsx`; `overrides.lightningcss=1.30.1`.
  ⚠️ The `expo:expo-tailwind-setup` skill pins `react-native-css@0.0.0-nightly.5ce6396` /
  `nativewind@5.0.0-preview.2`, which peer on **Expo 54** — wrong for our SDK 56. Use the versions above.
- **Config:** `metro.config.js` (`withNativewind`, `inlineVariables:false`,
  `globalClassNamePolyfill:false`), `postcss.config.mjs`. No `babel.config.js`, no
  `tailwind.config.js` (Tailwind v4 is CSS-first).
- **Tokens → CSS:** `src/global.css` `@theme` ports `src/theme` exactly. Both palettes map via
  `light-dark(<green>, <dark>)` (identical keys). Spacing is *not* redefined — the app scale
  (4/8/12/16/20/24) equals Tailwind's default `1–6` step (`p-4` == `spacing.lg`). Fonts are
  per-weight families (`font-bold` → `HankenGrotesk_700Bold`) because RN can't synthesize weight.
- **Color scheme:** the app forces light/dark from the store (`themeMode`), not the OS. NativeWind
  keys off RN `Appearance`, so `src/tw/ColorSchemeBridge` pushes `themeMode` →
  `Appearance.setColorScheme('light'|'dark'|'unspecified')`. Rendered once at the app root.
- **Wrappers:** import `View/Text/ScrollView/Pressable/TextInput/Link` from `@/tw`, `Image` from
  `@/tw/image`, animated from `@/tw/animated`. The big components are cast through a minimal
  `Styleable` type to dodge `useCssElement`'s TS2590 "union too complex" under strict.
- **RTL text:** no writing-direction-aware `textAlign` class exists for RN, so keep the i18n
  helper inline — `style={{ textAlign: textStart }}` — alongside className for everything else.
- **Icon colors:** `MaterialIcons` takes a `color` prop (not className), so screens still read
  `useColors()` for icon tints + the safe-area background.

## Remaining for full cutover (item stays open)

- Convert the other 20 `StyleSheet`/`makeUseStyles` files (screens, sheets, drawers, auth, Toast).
- Once all screens are converted, retire `src/theme`'s `makeUseStyles` (keep `useColors` only if
  still needed for icon/SVG props) and **flip the "no Tailwind/NativeWind, StyleSheet only" rule**
  in `coding-standards.md`, `CLAUDE.md`, `project-overview.md` (per the roadmap item).
- Device-verify pixel parity in light + dark + RTL.

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-27 — Stood up NativeWind v5 / Tailwind v4 (SDK-56-correct versions, not the skill's
  Expo-54 nightly pins): deps + `metro.config.js`/`postcss.config.mjs`, ported all `src/theme`
  tokens to `src/global.css` `@theme` (both palettes via `light-dark()`), added `src/tw/` wrappers
  + `ColorSchemeBridge` (store `themeMode` → RN `Appearance`), imported `global.css` in the root
  layout. Converted the pilot screen `community.tsx` from `StyleSheet` → `className`, pixel-faithful
  (RTL alignment kept inline, icon colors via `useColors`). tsc + lint clean.
