# Edit-log modal

**What / where:** Full-screen modal route to edit a today log's time, location, comment and diary — [src/app/edit-log.tsx](../../src/app/edit-log.tsx).

## Gotchas / lessons

- **Android scroll on this screen took THREE things** (a `flex:1` alone did NOT fix it):
  1. **`presentation: "card"`, not `"modal"`** (set in `_layout.tsx`). On Android a `modal` screen is a separate window the root `<KeyboardProvider>`'s events don't reach, so `KeyboardAwareScrollView` never applies the keyboard inset → nothing to scroll, diary stuck behind the keyboard. (Alternative if you want the modal look back: wrap the edit screen in its own nested `<KeyboardProvider>`.)
  2. **`style={{ flex: 1 }}` on the `KeyboardAwareScrollView`** so it's height-bounded under the flex-column `SafeAreaView` (same rule as every other scroll in the app).
  3. **`scrollEnabled={false}` on the multiline diary `TextInput`** so a drag on the textarea bubbles to the page instead of the textarea eating it (auto-grows, page scrolls). iOS was lenient throughout.
- **iOS compact `DateTimePicker` (`@expo/ui`) sizes its width from `style`, not content** — wrap it in a wider frame (or `items-end`) and the leading-aligned time pill leaves trailing dead-space the native control fills with an RTL artifact ("clock pushed too far right"). Fix: no frame wrapper, snug `style={{ width: 84, height: 44 }}` (84 = content, 44 = min touch). Same fix lives in AddSmokeSheet.
- Header **Save/Cancel** mirror via the RTL-safe `textAlign` swap (`textStart`/`textEnd` in `src/i18n/rtl.ts`), each pinned to its own reading edge — NOT `alignItems`/wrapper tricks (those don't mirror; both drift toward start). Cancel→`textStart`, Save→`textEnd`.
