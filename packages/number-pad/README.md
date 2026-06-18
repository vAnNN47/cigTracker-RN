# number-pad

An in-app numeric keypad bottom sheet for React Native — **no OS keyboard**, so
it looks and behaves identically on every platform (great for amount/limit
inputs, PWAs, etc.). Integer or decimal, optional prefix (e.g. a currency sign).

Theme is passed via props (no hard-coded colors). Peer dep: only
`react-native-safe-area-context` (for the bottom inset).

## Usage

```tsx
import { useRef } from "react";
import { NumberPad, NumberPadRef } from "./packages/number-pad";

const pad = useRef<NumberPadRef>(null);

// open it for a field:
pad.current?.present({
  title: "Max per day",
  initial: 7,
  onSubmit: (v) => setLimit(v),
});

// decimal + prefix:
pad.current?.present({
  title: "Price per pack",
  initial: 35,
  decimal: true,
  prefix: "₪ ",
  onSubmit: (v) => setPrice(v),
});

// keep one mounted near the root of the screen:
<NumberPad ref={pad} surface="#16181D" surfaceHigh="#1E2127" text="#F2F3F5" accent="#6CE5B1" onAccent="#0E0F12" textDim="#9AA0AA" />
```

## Props

| prop | default | notes |
|---|---|---|
| `surface` / `surfaceHigh` | dark grays | sheet + key backgrounds |
| `text` / `textDim` | white / gray | value + cancel text |
| `accent` / `onAccent` | green / black | Save button + its label |
| `backdropColor` / `backdropOpacity` | `#000` / `0.5` | dim layer |
| `cornerRadius` | `24` | sheet top corners |
| `cancelLabel` / `saveLabel` | `"Cancel"` / `"Save"` | localizable |

`present({ title, initial, decimal?, prefix?, onSubmit })` opens it; `dismiss()` closes.

## License

MIT
