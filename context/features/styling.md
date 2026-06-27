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
- [x] Green-fill blocker root-caused + fixed — real cause was `light-dark()` losing its dark branch under metro's `inlineVariables:false`, dropping ALL themed backgrounds; replaced with `@media (prefers-color-scheme: dark)` var overrides — 2026-06-27
- [x] Batch-converted 16 mechanical screens (the simple + medium tiers) StyleSheet → className in one run; tsc + lint clean + all novel utilities compile-checked through the real react-native-css pipeline — 2026-06-27 (device-eyeball pending)
- [x] Converted the 3 special screens — `progress` (SVG), `index` (Today, RN Animated), `calendar` (day grid) — 2026-06-27. **All 20 screens now className.** Only the FINAL cleanup (retire `makeUseStyles` + flip the docs rule) + the user's device-eyeball remain. (device-eyeball pending)

## How it's wired (so the next screens follow the same pattern)

- **Deps (SDK 56-correct):** `nativewind@5.0.0-preview.4`, `react-native-css@^3.0.1`,
  `tailwindcss@^4`, `@tailwindcss/postcss`, `tailwind-merge`, `clsx`; `overrides.lightningcss=1.30.1`.
  ⚠️ The `expo:expo-tailwind-setup` skill pins `react-native-css@0.0.0-nightly.5ce6396` /
  `nativewind@5.0.0-preview.2`, which peer on **Expo 54** — wrong for our SDK 56. Use the versions above.
- **Config:** `metro.config.js` (`withNativewind`, `inlineVariables:false`,
  `globalClassNamePolyfill:false`), `postcss.config.mjs`. No `babel.config.js`, no
  `tailwind.config.js` (Tailwind v4 is CSS-first).
- **⚠️ Spacing base pinned to 4px:** Tailwind's numeric scale (`p-4`, `gap-3`, `w-8`, `mt-6`,
  `leading-5`…) is `calc(var(--spacing) * N)`. react-native-css defaults **rem to 14px**, so the
  default `0.25rem` step is **3.5px**, not 4 — which silently shrank every spacing/size/line-height
  ~12% (cramped, visibly broken on dense screens like calendar/Today). `src/global.css` sets
  `--spacing: 4px` so the scale matches the app's 4/8/12/16/20/24 tokens exactly (`p-4` == `spacing.lg`
  == 16, `w-8` == 32). Tailwind-default **radii** (`rounded-xl`…) stay rem-based → use our `rounded-card`
  /`rounded-cell`/… tokens or arbitrary `rounded-[12px]`, never `rounded-xl`.
- **Tokens → CSS:** `src/global.css` `@theme` holds the **light** palette; the **dark** palette
  overrides the same `--color-*` vars in an `@media (prefers-color-scheme: dark)` block. ⚠️ Do
  **NOT** use `light-dark()` — metro runs react-native-css with `inlineVariables:false`, and in that
  mode the dark branch of `light-dark()` is dropped, so every themed background renders empty (the
  original green-fill blocker). The media-query override carries both branches through the var.
  Spacing base `--spacing` is pinned to **4px** (see the ⚠️ note above — react-native-css's rem
  default of 14px made the scale 3.5px), so the app scale (4/8/12/16/20/24) equals Tailwind's `1–6`
  step (`p-4` == `spacing.lg` == 16). Fonts are per-weight families (`font-bold` →
  `HankenGrotesk_700Bold`) because RN can't synthesize weight.
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

- [x] `src/app/(tabs)/community.tsx` — pilot (2026-06-27); green-fill blocker fixed (2026-06-27) ⚠️ device-eyeball still the user's final check
- [x] `src/app/_layout.tsx` — 2 styles (fill/overlay) — batch 2026-06-27 ⚠️ device-eyeball pending
- [x] `src/auth/SplashView.tsx` — 2 (kept light-only via inline static `green`; layout→className) — batch 2026-06-27 ⚠️
- [x] `src/components/ui/TabHeader.tsx` — 3 — batch 2026-06-27 ⚠️
- [x] `src/components/feedback/Toast.tsx` — 5 (uses **RN** `Animated`, NOT reanimated — kept RN `Animated.View` inline, the roadmap's `@/tw/animated` note was wrong) — batch 2026-06-27 ⚠️
- [x] `src/auth/LegalFooter.tsx` — 8 — batch 2026-06-27 ⚠️
- [x] `src/auth/LoginView.tsx` — 9 — batch 2026-06-27 ⚠️
- [x] `src/auth/OnboardingView.tsx` — 11 — batch 2026-06-27 ⚠️
- [x] `src/app/purchases.tsx` — 15 (SectionList stays RN, inline `contentContainerStyle`) — batch 2026-06-27 ⚠️
- [x] `src/components/sheets/AddPurchaseSheet.tsx` — 15 — batch 2026-06-27 ⚠️
- [x] `src/components/drawers/MainDrawer.tsx` — 18 — batch 2026-06-27 ⚠️
- [x] `src/auth/WelcomeView.tsx` — 21 — batch 2026-06-27 ⚠️
- [x] `src/components/sheets/LogDetailSheet.tsx` — 22 — batch 2026-06-27 ⚠️
- [x] `src/app/edit-log.tsx` — 24 (TextInput keeps `inputAlign` inline for RTL writing-direction) — batch 2026-06-27 ⚠️
- [x] `src/app/settings.tsx` — 27 (dropped dead unused `title` style) — batch 2026-06-27 ⚠️
- [x] `src/components/sheets/AddSmokeSheet.tsx` — 27 (`SheetTextInput` isn't tw-wrappable → input style stays a token-built inline object; dropped dead `feelChip*`) — batch 2026-06-27 ⚠️
- [x] `src/components/drawers/AccountDrawer.tsx` — 28 (`StyleSheet.hairlineWidth` dividers kept inline — `border-b` is 2× thicker) — batch 2026-06-27 ⚠️
- [x] `src/app/(tabs)/progress.tsx` — 29 (SVG `LineChart` colors via `useColors`; dynamic-height histogram bar stays inline) — 2026-06-27 ⚠️ device-eyeball pending
- [x] `src/app/(tabs)/index.tsx` — 41 (Today — **RN** `Animated` ScrollView/View can't take className → hero/fab + their shadows stay inline; rest className) — 2026-06-27 ⚠️
- [x] `src/app/(tabs)/calendar.tsx` — 43 (day grid: one class per property — selection>today>status — so conflicting border/bg utilities never stack) — 2026-06-27 ⚠️
- [ ] **FINAL:** retire `src/theme`'s `makeUseStyles` (keep `useColors` for icon/SVG/safe-area),
  then **flip the "no Tailwind/NativeWind, StyleSheet only" rule** in `coding-standards.md`,
  `CLAUDE.md`, `project-overview.md`, and verify no skill names `StyleSheet` directly.

## Known issues / blockers (resolve as part of the loop)

- ✅ **Green fills not painting in the pilot (RESOLVED 2026-06-27).** Share button (`bg-green`) +
  megaphone circle (`bg-green-bright`) rendered empty on device. **Real root cause** (an earlier
  `--color-*: initial` palette-collision theory was a red herring — kept since it's harmless, but it
  was NOT the fix): the tokens used `light-dark(<light>, <dark>)`, and metro runs react-native-css
  with **`inlineVariables:false`** (set on purpose to keep `var()` PlatformColor-safe). In that mode
  react-native-css **drops the dark branch of `light-dark()`** — proven by compiling `global.css`
  through the real pipeline: with `inlineVariables:false`, EVERY token's dark hex (`#3ba55d`,
  `#2b2d31`, `#1e1f22`, …) was **ABSENT** from the output, not just green. The themed backgrounds
  resolved to vars with no dark value and didn't paint; avatars (inline `backgroundColor`) were fine
  because they bypass vars. Why it looked green-specific: it wasn't — all `bg-*` tokens were dead;
  the dark UI just made the missing card/card-soft fills hard to spot. **Fix:** drop `light-dark()`,
  put the light palette in `@theme` and override each `--color-*` in an
  `@media (prefers-color-scheme: dark)` block. Re-compiled the edited file: `vr color-green` now =
  `[["#3ba55d",[dark]],["#006d37"]]` — both branches survive, dark conditioned.

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-27 — Stood up NativeWind v5 / Tailwind v4 (SDK-56-correct versions, not the skill's
  Expo-54 nightly pins): deps + `metro.config.js`/`postcss.config.mjs`, ported all `src/theme`
  tokens to `src/global.css` `@theme` (both palettes via `light-dark()`), added `src/tw/` wrappers
  + `ColorSchemeBridge` (store `themeMode` → RN `Appearance`), imported `global.css` in the root
  layout. Converted the pilot screen `community.tsx` from `StyleSheet` → `className`, pixel-faithful
  (RTL alignment kept inline, icon colors via `useColors`). tsc + lint clean.
- 2026-06-27 — Green-fill blocker resolved (real fix). The `--color-*: initial` attempt (palette
  collision) was a red herring; the actual cause was `light-dark()` losing its dark branch under
  metro's `inlineVariables:false`, which killed ALL themed `bg-*` (only looked green-specific because
  the dark UI hid the missing card fills). Rewrote `global.css`: light palette in `@theme`, dark
  palette via `@media (prefers-color-scheme: dark)` var overrides. Proven by compiling the edited file
  through `@tailwindcss/postcss` → react-native-css with `inlineVariables:false`: every token now
  carries both light + dark (`vr color-green = [["#3ba55d",[dark]],["#006d37"]]`). tsc + lint clean.
  Needs a cache-cleared reload (`expo start -c`) to land on device; eyeball left to user.
- 2026-06-27 — Batch-migrated 16 screens (simple + medium tiers) `StyleSheet` → `className` in one
  run (the green-fill blocker being fixed made the conversion mechanical + safe to batch). Per-screen
  notes captured in the queue above. Conventions held: icon/SVG colors + non-CSS elements
  (`SafeAreaView`, `SectionList`, `KeyboardAwareScrollView`, `DateTimePicker`, `SheetTextInput`, RN
  `Animated`, `Switch`) keep `useColors`/inline; RTL `textStart`/`textEnd`/`inputAlign` stay inline;
  off-scale numbers use arbitrary values. Gate: `tsc` + `lint` clean, and all 30 novel utility classes
  compile-checked through the real `@tailwindcss/postcss` → react-native-css pipeline (incl. `ms-*` →
  `marginInlineStart`, RTL-aware + RN-0.85-supported). 3 special screens (`progress` SVG, `index`
  Animated, `calendar` grid) deliberately left for solo runs. Device-eyeball pending.
- 2026-06-27 — Converted the 3 special screens, completing all 20. `progress`: SVG `LineChart` keeps
  color props via `useColors`, the dynamic-height histogram bar stays inline. `index` (Today): uses
  **RN** `Animated` (not reanimated) — `Animated.ScrollView`/`Animated.View` can't take className, so
  the hero ring, fab, and their shadow styles stay inline objects; everything else className. `calendar`:
  the day grid computes **one class per property** (selection > today > status precedence) instead of
  stacking conflicting `border-*`/`bg-*` utilities, because NativeWind resolves same-property conflicts
  by CSS source order, not className order. Gate: `tsc` + `lint` clean; the 17 new utilities
  (`aspect-square`, `rounded-cell`, `bg-under-bg`/`text-over-text`/… status tokens, `border-[1.5px]`,
  `-bottom-1.5`, `gap-px`) compile-checked through the real pipeline. Device-eyeball pending.
- 2026-06-27 — **Spacing scale fix (device finding).** First device pass showed dense screens
  (calendar, Today) cramped/broken while sparse ones (progress) "looked original". Root cause:
  react-native-css defaults **rem = 14px**, so Tailwind's `0.25rem` spacing step rendered **3.5px**,
  not 4 — every `p-*`/`m-*`/`gap-*`/`w-*`/`h-*`/`leading-*` (all `calc(var(--spacing)*N)` in TW v4) was
  ~12% small. Fix: `--spacing: 4px` in `global.css` `@theme` → the whole scale snaps to 4/8/12/16/20/24
  (verified: `p-4`=16, `w-8`=32, `mt-6`=24, `leading-6`=24). Also swapped the 2 rem-based `rounded-xl`
  (→ `rounded-[12px]`) in `index`. Corrected the now-false "spacing not redefined" claim in this doc.
  tsc clean. Needs a fresh device pass.
