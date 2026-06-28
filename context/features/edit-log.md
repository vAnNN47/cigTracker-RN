# Edit-log modal

**What / where:** Full-screen modal route to edit a today log's time, location, comment and diary — [src/app/edit-log.tsx](../../src/app/edit-log.tsx).

## Gotchas / lessons

- **Android scroll on this screen — the linchpin is `mode="layout"` on `KeyboardAwareScrollView`** (a `flex:1` alone did NOT fix it; iOS was lenient throughout). keyboard-controller 1.21.x has a broken Android **`mode="insets"`** (the default): its internal contentInset/clipping fails to extend the scroll range when the keyboard opens, so content stays trapped behind it (lib issue #1394). **`mode="layout"`** appends a real spacer view → genuine scroll range. Supporting pieces:
  1. **`mode="layout"`** — the actual fix (see above).
  2. **`presentation: "card"`, not `"modal"`** (`_layout.tsx`) — on Android a `modal` is a separate window the root `<KeyboardProvider>`'s events don't reach. (Want the modal look back? wrap the edit screen in its own nested `<KeyboardProvider>`.)
  3. **`style={{ flex: 1 }}`** on the scroll so it's height-bounded under the flex-column `SafeAreaView`.
  4. **`scrollEnabled={false}` on the multiline diary** so it auto-grows. **Known caveat:** dragging *on* the diary textarea still doesn't scroll the page (Android multiline grabs the vertical drag) — inherent, minor; scroll from anywhere else works.
- **iOS compact `DateTimePicker` (`@expo/ui`) sizes its width from `style`, not content** — wrap it in a wider frame (or `items-end`) and the leading-aligned time pill leaves trailing dead-space the native control fills with an RTL artifact ("clock pushed too far right"). Fix: no frame wrapper, snug `style={{ width: 84, height: 44 }}` (84 = content, 44 = min touch). Same fix lives in AddSmokeSheet.
- Header **Save/Cancel** mirror via the RTL-safe `textAlign` swap (`textStart`/`textEnd` in `src/i18n/rtl.ts`), each pinned to its own reading edge — NOT `alignItems`/wrapper tricks (those don't mirror; both drift toward start). Cancel→`textStart`, Save→`textEnd`.
