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

## Per-screen procedure (repeatable — do ONE screen per run)

This is the exact recipe used for the `community.tsx` pilot. The infra (deps/config/tokens/
wrappers) is already in place, so each remaining screen is just steps 1–5:

1. **Restate + read** the target's `StyleSheet`. Keep the original open to diff against (the
   `makeUseStyles((c) => …)` block is the source of truth for every value).
2. **Swap imports:** RN `View/Text/ScrollView/Pressable/TextInput` → `@/tw`; `Image` (expo-image)
   → `@/tw/image`; `Animated.View` → `@/tw/animated`. Drop `StyleSheet`/`makeUseStyles`/`fonts`/
   `radius`/`spacing` imports once unused. **Keep `useColors()`** — still needed for icon `color`
   props (MaterialIcons/SVG) and any non-CSS element (e.g. `SafeAreaView` background).
3. **Map each style → className** (see the cheatsheet below). Use **arbitrary values**
   (`text-[15px]`, `leading-[21px]`, `rounded-[19px]`, `tracking-[1.2px]`) for any number that
   isn't on Tailwind's default 4px step, so it's pixel-exact — don't approximate to the nearest
   preset.
4. **RTL:** there's no writing-direction-aware `textAlign` class, so keep
   `style={{ textAlign: textStart }}` inline on text that had it. `flex-row` auto-flips under RTL
   (RN handles it) — leave it.
5. **Verify:** `npx tsc --noEmit` + `npm run lint` clean (the automated gate) **then device-test in
   light + dark + RTL and eyeball it against the original** — ⚠️ tsc+lint canNOT see a single pixel,
   so the device compare is the real check and is **required** before ticking the screen off.
6. **If the screen imports a native module** that older dev builds lack (e.g. `expo-clipboard`),
   load it **lazily** (see `src/lib/clipboard.ts`) so a metro-only reload doesn't crash the app.

### className cheatsheet (this app's tokens)

| StyleSheet | className |
|---|---|
| `color: c.text` / `c.textDim` / `c.textSecondary` | `text-text` / `text-text-dim` / `text-text-secondary` |
| `backgroundColor: c.bg`/`card`/`cardSoft`/`green`/`greenBright` | `bg-bg`/`bg-card`/`bg-card-soft`/`bg-green`/`bg-green-bright` |
| `borderColor: c.border` (+`borderWidth:1`) | `border border-border` |
| `fontFamily: fonts.regular/medium/semibold/bold` | `font-regular`/`font-medium`/`font-semibold`/`font-bold` |
| `fontSize: 15` / `lineHeight: 21` | `text-[15px]` / `leading-[21px]` |
| `borderRadius: radius.card`(13)/`pill`(20)/`button`(16) | `rounded-card` / `rounded-pill` / `rounded-button` |
| `padding: spacing.lg`(16) / `gap: spacing.md`(12) | `p-4` / `gap-3` (4px step: xs→1 sm→2 md→3 lg→4 xl→5 xxl→6) |
| `marginTop: 2` / `marginTop: 1` | `mt-0.5` / `mt-px` |
| `textAlign: "center"` / `textTransform: "uppercase"` | `text-center` / `uppercase` |
| `textAlign: textStart` (RTL) | keep inline `style={{ textAlign: textStart }}` |

## Migration queue (simplest → hardest — run one per `/fire styling`)

Order chosen by style-block count (smallest first) so each run stays small. Tick a screen **only
after device-verifying it** in light + dark + RTL against the original.

- [x] `src/app/(tabs)/community.tsx` — pilot (2026-06-27) ⚠️ device-verify still pending (green-fill bug, see below)
- [ ] `src/app/_layout.tsx` — 2 styles (fill/overlay)
- [ ] `src/auth/SplashView.tsx` — 2
- [ ] `src/components/ui/TabHeader.tsx` — 3
- [ ] `src/components/feedback/Toast.tsx` — 5 (Animated.View — use `@/tw/animated`)
- [ ] `src/auth/LegalFooter.tsx` — 8
- [ ] `src/auth/LoginView.tsx` — 9
- [ ] `src/auth/OnboardingView.tsx` — 11
- [ ] `src/app/purchases.tsx` — 15 (SectionList)
- [ ] `src/components/sheets/AddPurchaseSheet.tsx` — 15
- [ ] `src/components/drawers/MainDrawer.tsx` — 18
- [ ] `src/auth/WelcomeView.tsx` — 21
- [ ] `src/components/sheets/LogDetailSheet.tsx` — 22
- [ ] `src/app/edit-log.tsx` — 24
- [ ] `src/app/settings.tsx` — 27
- [ ] `src/components/sheets/AddSmokeSheet.tsx` — 27
- [ ] `src/components/drawers/AccountDrawer.tsx` — 28
- [ ] `src/app/(tabs)/progress.tsx` — 29 (SVG charts — colors stay via `useColors`)
- [ ] `src/app/(tabs)/index.tsx` — 41 (Today — Ring/FAB/pulse, Animated)
- [ ] `src/app/(tabs)/calendar.tsx` — 43 (heaviest — day grid)
- [ ] **FINAL:** retire `src/theme`'s `makeUseStyles` (keep `useColors` for icon/SVG/safe-area),
  then **flip the "no Tailwind/NativeWind, StyleSheet only" rule** in `coding-standards.md`,
  `CLAUDE.md`, `project-overview.md`, and verify no skill names `StyleSheet` directly.

## Known issues / blockers (resolve as part of the loop)

- ⚠️ **Green fills not painting in the pilot (OPEN).** In the `community.tsx` screenshots the share
  button (`bg-green`) and the megaphone circle (`bg-green-bright`) don't visibly fill — in dark the
  icon (dark glyph on the missing circle) disappears. The *compiled* CSS is correct
  (`background-color: var(--color-green)`), and themed **text** colors (also `var()` + `light-dark`)
  DO resolve, so it's narrower than "vars don't work". **First task before more screens:** repro +
  root-cause (try `metro.config.js` `inlineVariables: true`; test a plain-hex bg vs a token bg vs a
  `light-dark()` bg to isolate whether it's `var()` scope, `light-dark()`, or background-on-`<Text>`;
  check react-native-css issues). Don't convert more screens until green/`bg-*` tokens paint.

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-27 — Stood up NativeWind v5 / Tailwind v4 (SDK-56-correct versions, not the skill's
  Expo-54 nightly pins): deps + `metro.config.js`/`postcss.config.mjs`, ported all `src/theme`
  tokens to `src/global.css` `@theme` (both palettes via `light-dark()`), added `src/tw/` wrappers
  + `ColorSchemeBridge` (store `themeMode` → RN `Appearance`), imported `global.css` in the root
  layout. Converted the pilot screen `community.tsx` from `StyleSheet` → `className`, pixel-faithful
  (RTL alignment kept inline, icon colors via `useColors`). tsc + lint clean.
