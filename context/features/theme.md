# Theme & design tokens

**What / where:** Central design tokens — palettes (light `green` + dark `dark`), fonts, radius, spacing, `useColors()` — in `src/theme/index.ts`. Every screen reads its colors through `useColors()`, so retuning a palette flips the whole app. (Styling itself is NativeWind/`className`; these JS tokens remain for icon/SVG colors, RN `Animated`, and other inline cases — see [styling.md](styling.md).) Legacy `colors` (haze periwinkle) survives only for the two SVG charts' neutral track/grid defaults ([Ring](../../src/components/charts/Ring.tsx), [LineChart](../../src/components/charts/LineChart.tsx)).

## Gotchas / lessons

- One palette swap → whole app via `useColors()`. Dark = Discord neutral-gray surfaces + forest-green accent; light `green` palette untouched.
- Dark `onGreen` must stay **dark** (`#06231A`, 5.3:1) — white on the `#3BA55D` accent is 3.1:1 and **fails** AA for button text.
- **Intentionally theme-invariant — do NOT tokenize:** savings-card `#FFFFFF`/`rgba(0,80,39,0.12)` (bright-green card in both themes), `community` `AVATAR_TINTS` (decorative per-author color array), charts' legacy `colors` track/grid defaults.
- Semantic tokens live in both palettes: `error`, count-status (`underBg`/`underBorder`/`overBg`/`overBorder`/`overText`), `histSoft`, `feelChipSel`, `shadow`.
- Known marginal contrast left to `[a11y]`: small colored text on cards (`green` on `card` ≈4.4:1) — brightening the accent or darkening cards is a design call.
