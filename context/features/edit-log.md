# Edit-log modal

**What / where:** Full-screen modal route to edit a today log's time, location, comment and diary — [src/app/edit-log.tsx](../../src/app/edit-log.tsx).

## Gotchas / lessons

- **`KeyboardAwareScrollView` (react-native-keyboard-controller) needs `style={{ flex: 1 }}`** to be height-bounded under the flex-column `SafeAreaView` (header + scroll). Without it, the scroll sizes to content, overflows the screen, and **won't scroll on Android** (the long diary becomes unreachable); focusing an input made keyboard-controller resize it and scroll temporarily, masking the cause. iOS was lenient. Same flex-1 rule as every other scroll in the app.
- **iOS compact `DateTimePicker` (`@expo/ui`) sizes its width from `style`, not content** — wrap it in a wider frame (or `items-end`) and the leading-aligned time pill leaves trailing dead-space the native control fills with an RTL artifact ("clock pushed too far right"). Fix: no frame wrapper, snug `style={{ width: 84, height: 44 }}` (84 = content, 44 = min touch). Same fix lives in AddSmokeSheet.
- Header **Save/Cancel** mirror via the RTL-safe `textAlign` swap (`textStart`/`textEnd` in `src/i18n/rtl.ts`), each pinned to its own reading edge — NOT `alignItems`/wrapper tricks (those don't mirror; both drift toward start). Cancel→`textStart`, Save→`textEnd`.
