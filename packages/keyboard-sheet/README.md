# keyboard-sheet

A Flutter-style bottom sheet for React Native that gets the **keyboard** right —
identical on iOS and Android, smooth even on old devices (tested on a Galaxy S9).

- Keyboard **pushes** the sheet up and the sheet **keeps its height** (it doesn't
  balloon to full screen).
- The last element (e.g. a Save button) **rests on the keyboard**, any device.
- **Drag to dismiss from anywhere** — including from on top of a text input —
  with **no keyboard flash**.
- Native drag-down + tap-outside dismiss, hardware-back on Android.
- No `@gorhom/bottom-sheet`, no native sheet module — just the libs below.

## Why this exists

Five interacting problems make this hard, and no single library/doc solves all:

1. `KeyboardProvider` forces edge-to-edge, and an RN `<Modal>` is a separate
   window where keyboard-controller can't see the keyboard → we render through an
   **in-tree Portal**, not a Modal.
2. Push-don't-resize → **`KeyboardStickyView`**.
3. Drag is a **pure Reanimated** translate; dismiss is decided **on release** →
   no mid-drag keyboard race.
4. The keyboard "flash" = `TextInput` self-focuses on touch. Fix = a transparent
   overlay + **`Gesture.Tap().maxDistance(10)`**: a tap focuses, a drag fails the
   Tap and falls through to the Pan.
5. Don't use RN `Pressable` for that overlay (races with gesture-handler) and
   don't rely on `requireExternalGestureToFail` (unreliable — RNGH #3326).

## Peer dependencies

```
npm i react-native-keyboard-controller react-native-reanimated react-native-gesture-handler react-native-safe-area-context
# reanimated also needs react-native-worklets on RN 0.79+/SDK 53+
```

These are native modules → use a dev build (not Expo Go) and rebuild after install.

## Root setup (once)

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "./packages/keyboard-sheet";

export default function Root() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          {/* ...your app / navigator... */}
          <PortalHost />
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
```

## Usage

```tsx
import { useRef } from "react";
import { Pressable, Text } from "react-native";
import { KeyboardSheet, KeyboardSheetRef, SheetTextInput } from "./packages/keyboard-sheet";

export function Example() {
  const sheet = useRef<KeyboardSheetRef>(null);
  return (
    <>
      <Pressable onPress={() => sheet.current?.present()}>
        <Text>Open</Text>
      </Pressable>

      <KeyboardSheet ref={sheet} backgroundColor="#16181D" handleColor="#262A31" cornerRadius={28}>
        <SheetTextInput placeholder="Comment" placeholderTextColor="#9AA0AA" />
        <SheetTextInput placeholder="Notes" multiline scrollEnabled={false} style={{ height: 110 }} />
        <Pressable onPress={() => sheet.current?.dismiss()} style={{ padding: 14, backgroundColor: "#6CE5B1", borderRadius: 16, alignItems: "center" }}>
          <Text>Save</Text>
        </Pressable>
      </KeyboardSheet>
    </>
  );
}
```

> Always use `SheetTextInput` (not RN `TextInput`) for fields inside the sheet —
> that's what makes drag-from-input work without a keyboard flash. For multiline
> fields use a fixed `height` + `scrollEnabled={false}`.

## Props (KeyboardSheet)

| prop | default | notes |
|---|---|---|
| `backgroundColor` | `#1b1b1f` | sheet surface |
| `handleColor` | `#3a3a3f` | grabber |
| `cornerRadius` | `24` | top corners |
| `backdropColor` / `backdropOpacity` | `#000` / `0.5` | dim layer |
| `contentStyle` | — | extra container style |
| `onDismiss` | — | called after the sheet fully closes |

API: `ref.present()` / `ref.dismiss()`.

## License

MIT — do whatever you want.
