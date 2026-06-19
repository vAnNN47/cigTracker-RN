# month-pager

A horizontally-**swipeable month carousel** for React Native — drag left/right to
page between months with an iOS-calendar feel. You render the month grid; the
pager owns the gesture, the slide, and the paging physics.

- **Bring your own grid.** `renderMonth(monthFirst)` is called for the previous,
  current, and next month — style the days however you like.
- **No height jump / no reflow.** The center month renders in normal flow and
  defines the height; neighbours are absolutely positioned one page to each side.
- **Flicker-free.** Months sit at stable absolute slots keyed to a fixed anchor;
  only the translate is animated. Committing a page never resets the offset or
  swaps the page under your finger — the page you dragged just becomes the
  centered one (same React key, no remount), so there's no old-month flash.
- **Arrows animate too.** Because it slides toward whatever `focused` is, an
  external `focused` change (e.g. header prev/next buttons) animates instead of
  jumping.
- **Plays nice with vertical scroll.** `activeOffsetX` + `failOffsetY` mean
  vertical drags fall through to a parent `ScrollView` and taps on day cells
  still register.
- **RTL-aware.** In RTL the "next" month sits on the left, matching flipped
  header arrows.
- **Gated paging.** `canGoNext` / `canGoPrev` block paging in a direction (e.g.
  no swiping into the future) with rubber-band resistance + snap-back.

Built on Reanimated + gesture-handler (+ worklets). No native module of its own.

## Peer dependencies

```
npm i react-native-reanimated react-native-worklets react-native-gesture-handler
```

Wrap your app root in `GestureHandlerRootView` (you almost certainly already do).

## Usage

```tsx
import { MonthPager } from "./packages/month-pager";

const [focused, setFocused] = useState(() => firstOfMonth(new Date()));

<MonthPager
  focused={focused}
  onChange={setFocused}
  canGoNext={!atCurrentMonth}
  isRTL={I18nManager.isRTL}
  renderMonth={(monthFirst) => <MyMonthGrid month={monthFirst} />}
/>
```

## Props

| prop | default | notes |
|---|---|---|
| `focused` | — | first-of-month date currently centered (controlled) |
| `onChange` | — | called with the new first-of-month when the user pages |
| `renderMonth` | — | `(monthFirst: Date) => ReactNode` — renders one month's grid |
| `canGoNext` | `true` | allow paging to the later month |
| `canGoPrev` | `true` | allow paging to the earlier month |
| `isRTL` | `false` | flip which side is "next" to match RTL layouts |

## Notes

`renderMonth` is called for three months on every render; keep it cheap (it's
just views — the heavy lifting like day lookups should already be memoised in
your store/selectors). For the smoothest swipe, render a fixed number of week
rows so every month is the same height.

## License

MIT
