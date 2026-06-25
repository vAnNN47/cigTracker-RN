# slide-drawer

A lightweight, RTL-aware slide-in drawer for React Native that can **expand in
place** — it opens partial (e.g. 76%) and, on demand, the *same* panel grows to
full screen and cross-fades to a new "screen", instead of stacking a second
panel over the first.

- **Opens from its own physical edge** — RTL → right, LTR → left — and grows from
  that same edge in both the partial and full states.
- **Expand in place**: set `expanded` and a list tap turns the 76% drawer into a
  full screen (with your own back button); collapsing reverses it.
- **Cross-fade**: `children` (the collapsed list) fade out as `expandedContent`
  (the screen) fade in, synced to the width animation.
- **No reflow while growing**: each layer is laid out at its final width from the
  first frame and the growing panel just uncovers it through a clip, so text
  never re-wraps mid-stretch.
- **Drag to close**: a horizontal drag toward the panel's own edge dismisses it —
  the panel tracks the finger, then slides off past a threshold or on a fling.
- Scrim backdrop (tap to close) + Android hardware-back handling.
- App-agnostic: colors are props (`panelColor` / `scrimColor`), no theme import.

## Peer dependencies

```
npm i react-native-reanimated react-native-worklets react-native-gesture-handler
```

(`react-native-worklets` provides `scheduleOnRN`, the non-deprecated replacement
for Reanimated's `runOnJS`; it ships with Reanimated on RN 0.79+/SDK 53+.
`react-native-gesture-handler` powers drag-to-close — wrap your app in its
`GestureHandlerRootView`.) These are native modules → use a dev build and rebuild
after install.

## Usage

```tsx
import { SlideDrawer } from "../../packages/slide-drawer";

function Menu() {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<string | null>(null);

  return (
    <SlideDrawer
      open={open}
      side="start"
      widthPct={0.76}
      expanded={screen !== null}
      onClose={() => { setOpen(false); setScreen(null); }}
      onCollapse={() => setScreen(null)}
      panelColor="#fff"
      expandedContent={
        screen && (
          <SafeAreaView>
            <Pressable onPress={() => setScreen(null)}><BackIcon /></Pressable>
            <Text>{screen}</Text>
          </SafeAreaView>
        )
      }
    >
      {/* collapsed (76%) content */}
      <Pressable onPress={() => setScreen("Reminders")}><Text>Reminders</Text></Pressable>
    </SlideDrawer>
  );
}
```

Reset the expanded state when the drawer closes (e.g. in a `useEffect` on `open`)
so it reopens collapsed.

## Props

| prop | default | notes |
|---|---|---|
| `open` | — | mounts + slides the drawer in |
| `side` | `"start"` | reading-relative edge; `start` = right in RTL / left in LTR |
| `forceSide` | — | override the RTL-derived physical side (`"left"`/`"right"`) |
| `widthPct` | `0.78` | collapsed width as a fraction of the screen; `1` = full screen |
| `expanded` | `false` | grow to full screen and cross-fade to `expandedContent` |
| `expandedContent` | — | the screen shown while `expanded`; render your own back control |
| `onClose` | — | scrim tap / hardware-back while collapsed |
| `onCollapse` | — | hardware-back while `expanded` (falls back to `onClose`) |
| `panelColor` | `#ffffff` | panel surface color |
| `scrimColor` | `rgba(9,29,46,0.45)` | backdrop color (includes its own alpha) |
| `children` | — | collapsed content |

## License

MIT — do whatever you want.
