# Styling — NativeWind v5 / Tailwind v4

**What / where:** The app-wide styling system — **NativeWind v5 / Tailwind v4** (`react-native-css`),
`className` on every screen. Tokens are ported to CSS in [src/global.css](../../src/global.css);
CSS-enabled component wrappers live in [src/tw/](../../src/tw/). The migration off the old
`StyleSheet`/`makeUseStyles` path is **complete** — all 20 screens are `className`, the old path is
retired. The JS theme tokens (`useColors()`) remain only for the inline cases `className` can't reach
(icon/SVG colors, RN `Animated`, `SafeAreaView`, dynamic values).

## How it's wired

- **Deps (SDK 56-correct):** `nativewind@5.0.0-preview.4`, `react-native-css@^3.0.1`,
  `tailwindcss@^4`, `@tailwindcss/postcss`, `tailwind-merge`, `clsx`; `overrides.lightningcss=1.30.1`.
- **Config:** `metro.config.js` (`withNativewind`, `inlineVariables:false`,
  `globalClassNamePolyfill:false`), `postcss.config.mjs`. No `babel.config.js`, no
  `tailwind.config.js` (Tailwind v4 is CSS-first).
- **Tokens → CSS:** `src/global.css` `@theme` holds the **light** palette; the **dark** palette
  overrides the same `--color-*` vars in an `@media (prefers-color-scheme: dark)` block. Fonts are
  per-weight families (`font-bold` → `HankenGrotesk_700Bold`) because RN can't synthesize weight.
- **Color scheme:** the app forces light/dark from the store (`themeMode`), not the OS. NativeWind
  keys off RN `Appearance`, so `src/tw/ColorSchemeBridge` pushes `themeMode` →
  `Appearance.setColorScheme(...)`, rendered once at the app root.
- **Wrappers:** import `View/Text/ScrollView/Pressable/TextInput/Link` from `@/tw`, `Image` from
  `@/tw/image`, animated from `@/tw/animated`. Big components are cast through a minimal `Styleable`
  type to dodge `useCssElement`'s TS2590 "union too complex" under strict.
- **Icon colors:** `MaterialIcons`/SVG take a `color` prop (not className), so screens still read
  `useColors()` for icon tints + the safe-area background.

## className cheatsheet (this app's tokens)

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

## Per-screen procedure (if you add or convert a screen)

1. Swap imports: RN `View/Text/ScrollView/Pressable/TextInput` → `@/tw`; `Image` → `@/tw/image`;
   `Animated.View` → `@/tw/animated`. Drop `StyleSheet`/`fonts`/`radius`/`spacing` once unused; **keep
   `useColors()`** for icon `color` props + non-CSS elements.
2. Map each style → className (cheatsheet above). Use **arbitrary values** (`text-[15px]`,
   `rounded-[19px]`, `tracking-[1.2px]`) for any number off Tailwind's 4px step, so it's pixel-exact.
3. **RTL:** keep `style={{ textAlign: textStart }}` inline (no writing-direction class); `flex-row`
   auto-flips under RN.
4. **Verify:** `npx tsc --noEmit` + `npm run lint`, then device-eyeball light + dark + RTL against the
   original — tsc/lint can't see a pixel.

## Gotchas / lessons

- ⚠️ **Never use `light-dark()`** for theme colors. metro runs react-native-css with
  `inlineVariables:false` (on purpose, to keep `var()` PlatformColor-safe), and in that mode it
  **drops the dark branch of `light-dark()`** — so every themed `bg-*` renders empty (the original
  "green fills not painting" blocker; it only *looked* green-specific because the dark UI hid the
  missing card fills). Fix/rule: light palette in `@theme`, dark via `@media (prefers-color-scheme: dark)`
  var overrides — both branches survive.
- ⚠️ **Spacing base is pinned to `--spacing: 4px`** in `global.css`. react-native-css defaults **rem
  to 14px**, so Tailwind's `0.25rem` step renders **3.5px** not 4 — silently shrinking every
  `p-/m-/gap-/w-/h-/leading-*` ~12% (cramped/broken on dense screens). Pinning 4px snaps the scale to
  4/8/12/16/20/24 (`p-4`==16, `w-8`==32). **Radii stay rem-based** → use `rounded-card`/`rounded-cell`
  or arbitrary `rounded-[12px]`, never `rounded-xl`.
- **Not tw-wrappable, stay inline/`useColors`:** `SafeAreaView`, `SectionList`,
  `KeyboardAwareScrollView`, `DateTimePicker`, `SheetTextInput`, RN `Animated.*` (Today's hero/fab +
  their shadows), `Switch`, `StyleSheet.hairlineWidth` dividers (`border-b` is 2× thicker).
- **Toast uses RN `Animated`, not reanimated** — keep its `Animated.View` inline (the old roadmap's
  `@/tw/animated` note was wrong).
- **NativeWind resolves same-property conflicts by CSS source order, not className order** — so the
  calendar day grid computes **one class per property** (selection > today > status precedence)
  instead of stacking conflicting `border-*`/`bg-*` utilities.
- ⚠️ The `expo:expo-tailwind-setup` skill pins `react-native-css@0.0.0-nightly…` / `nativewind@…preview.2`,
  which peer on **Expo 54** — wrong for our SDK 56. Use the dep versions above.
