# pull-refresh

A `ScrollView` with a **tunable, top-only** pull-to-refresh for React Native —
fixes the two annoyances of the built-in `RefreshControl`:

- **Only triggers at the top.** Scrolling mid-list never refreshes.
- **No premature trigger.** The pull is accumulated from per-frame deltas *only
  while at the top*, so scrolling up to the top with a long drag doesn't
  pre-load the pull. You must deliberately pull past `threshold`.
- **Tunable sensitivity** via `threshold` + `resistance`.

Built on Reanimated + gesture-handler (+ worklets). No native module of its own.

## Peer dependencies

```
npm i react-native-reanimated react-native-worklets react-native-gesture-handler
```

Wrap your app root in `GestureHandlerRootView` (you almost certainly already do).

## Usage

```tsx
import { RefreshableScrollView } from "./packages/pull-refresh";

<RefreshableScrollView
  onRefresh={async () => { await reload(); }}
  threshold={90}
  spinnerColor="#6CE5B1"
  contentContainerStyle={{ padding: 20 }}
>
  {/* content */}
</RefreshableScrollView>
```

## Props

| prop | default | notes |
|---|---|---|
| `onRefresh` | — | called when triggered; may be async (spinner shows until it resolves) |
| `threshold` | `90` | pull distance (px) to trigger |
| `resistance` | `0.5` | drag→pull ratio; lower = harder pull |
| `spinnerColor` | `#888888` | ActivityIndicator color |
| `style` / `contentContainerStyle` | — | passthrough |

## License

MIT
