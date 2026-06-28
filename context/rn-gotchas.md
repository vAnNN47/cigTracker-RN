# RN / Expo gotchas — solved once, never re-debug

Hard-won bugs that ate hours. **Hit the symptom → apply the fix → move on.** Don't re-investigate.
This file is auto-loaded via `CLAUDE.md`. Each entry: **Symptom → Fix** (+ ref). Living code lives in
the cited files; per-area detail in `context/features/<area>.md`.

## Inputs / TextInput

- **iOS caret jumps backwards on fast typing** → field is **controlled** (`value` from state).
  Make it **uncontrolled**: `defaultValue` + a `ref`, read only at save. (`edit-log.tsx`, `AddSmokeSheet`.)
- **Hebrew (RTL) ScrollView won't scroll at all on Android** → a **single-line** `TextInput` with
  `textAlign:"right"` kills it (RN #16206). Fix per-platform: **Android → `writingDirection:"rtl"`
  only, NO `textAlign`**; iOS → full `inputAlign`. Multiline inputs are immune. (`edit-log.tsx`.)

## Scroll / keyboard

- **Android: content trapped behind keyboard, scroll range never extends** → keyboard-controller
  1.21.x default `mode="insets"` is broken (#1394). Fix: **`mode="layout"`** on
  `KeyboardAwareScrollView` + `flex:1` + multiline `scrollEnabled={false}`. (`edit-log.tsx`.)
- **A modal screen's keyboard scroll doesn't work on Android** → an RN `modal` presentation is a
  separate window the root `<KeyboardProvider>` can't see. Use **`presentation:"card"`** (or wrap the
  screen in its own nested `KeyboardProvider`). (`_layout.tsx`.)
- **Android: ScrollView drops ALL its children when you add pull-to-refresh** → `RefreshControl`
  must be a **direct** `<RefreshControl>` element on the ScrollView, never wrapped in a custom
  component. (KI-1; `(tabs)/index.tsx`.)

## Bottom sheets

- **Sheet grows up under the status bar + can't scroll to top fields** → bottom-anchored sheets have
  no height cap. Either set `KeyboardSheet`'s opt-in **`scrollable`** (caps body below top inset +
  scrolls; grabber-only drag) OR — preferred for forms — **escalate to a full-screen modal**
  (Material 3 / HIG: sheets = brief tasks only). (`keyboard-sheet`, `AddSmokeSheet`→`/edit-log` add mode.)
- **TextInput inside a sheet flashes the keyboard / fights drag** → use the package's
  **`SheetTextInput`**, not RN `TextInput`. (`keyboard-sheet`.)

## Animations (reanimated)

- **Lint `react-hooks/immutability`: "value passed as a hook argument cannot be modified"** → you
  wrote `sharedValue.value = …` inside a **`useCallback`** (e.g. `useFocusEffect(useCallback(...))`).
  Mutate the shared value inside a **`useEffect`** or an **event handler** instead; for per-focus work
  use `navigation.addListener("focus", …)` in a `useEffect`. (`(tabs)/index.tsx`.)

## @expo/ui

- **Compact `DateTimePicker` shows a red artifact / "pushed too far right" in RTL** → it sizes width
  from `style`, not content; a wrapper frame leaves trailing dead-space. Fix: **no wrapper, snug
  `style={{ width: 84, height: 44 }}`** (84 = content, 44 = min touch). (`edit-log.tsx`, `AddSmokeSheet`.)

## Accessibility (VoiceOver / TalkBack)

- **A button reads as junk ("CANNA") or says nothing** → an icon-only / icon+text `Pressable` with no
  label; VoiceOver reads the `@expo/vector-icons` glyph. Fix: **`accessibilityRole="button"` +
  `accessibilityLabel`** on the control, **`accessible={false}`** on decorative icons. (`(tabs)/index.tsx`.)
- **Toast / dynamic content isn't announced** → RN doesn't auto-announce new views. Call
  **`AccessibilityInfo.announceForAccessibility(msg)`** on show + `accessibilityLiveRegion="polite"`. (`Toast.tsx`.)
- **Large OS font shatters fixed layouts (clipped rows, text under status bar)** → clamp scaling:
  the `@/tw` `Text` defaults **`maxFontSizeMultiplier: 1.4`** app-wide. (`src/tw/index.tsx`.)
- **Light-mode muted gray fails WCAG AA** → compute contrast vs `bg`/`card` per theme; `textDim`
  darkened to `#5E6B5F` (~5.3:1). (`theme/index.ts`, `global.css`.)

## Native modules (dev client)

- **`Cannot find native module 'ExpoXxx'` in dev, works in release** → native dep added but the dev
  client wasn't recompiled. Fix: **rebuild the dev client** (`eas build --profile development` for iOS
  / `npm run android`). For graceful degradation, **lazy-`import()` + `try/catch`** the module
  (`src/lib/clipboard.ts`). Expected behaviour, not a code bug.
