# Theme & design tokens

**What / where:** Central design tokens — palettes (light `green` + dark `dark`), fonts, radius,
spacing, `useColors()` / `makeUseStyles()` — in `src/theme/index.ts`. Every screen reads its
colors through `useColors()`, so retuning a palette flips the whole app. Legacy `colors` (haze
periwinkle) survives only for the two SVG charts' neutral track/grid defaults
(`Ring`, `LineChart`).

## Done

- [x] Light/dark palette seam via `useColors()` + theme-reactive `makeUseStyles()` — pre-existing
- [x] Discord-style dark mode — neutral-gray surfaces + forest-green accent — 2026-06-27
- [x] Semantic color tokens (`error`, status, `histSoft`, `feelChipSel`, `shadow`) — 2026-06-27

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-27 — **Discord dark redesign** (branch `perf-render-audit_theme_01`): retuned the `dark`
  palette to neutral-gray Discord surfaces (`bg #1E1F22`, `card #2B2D31`, `cardSoft #313338`,
  text `#F2F3F5`) with a forest-green accent (`green #3BA55D`, `greenBright #4FCC7E`, `onGreen`
  flipped to white since the accent darkened); hero `ring`/`ringStroke` and `dot` retoned to
  match. Light `green` palette untouched. One palette swap → whole app via `useColors()`.
- 2026-06-27 — **Semantic color tokens** (same branch): added `error` + count-status
  (`underBg`/`underBorder`/`overBg`/`overBorder`/`overText`) + `histSoft` + `feelChipSel` +
  `shadow` to **both** palettes (themed per theme — softer red `#ED7373` + forest-tinted status
  in dark). Replaced the hardcoded literals: `BAD #C0392B` (settings, progress, AddPurchaseSheet,
  LoginView, WelcomeView), calendar `UNDER_*/OVER_*` consts, progress `HIST_SOFT`, AddSmokeSheet
  `feelChipSel` rgba, and `shadowColor "#1B2A4A"` (×3 index, Toast). **Left as-is, on purpose:**
  the savings-card `#FFFFFF`/`rgba(0,80,39,0.12)` (intentionally theme-invariant — the card is
  bright-green in both themes; documented inline) and `community` `AVATAR_TINTS` (a decorative
  per-author color *array* — can't be a single-string palette token). Charts' legacy `colors`
  track/grid defaults untouched (theme-agnostic; out of the two items' scope).
- 2026-06-27 — **`/app-ui-design` audit of the new dark palette** (WCAG 2.2 AA contrast).
  One critical fix: dark `onGreen` was white on the `#3BA55D` accent = **3.1:1** (fails AA for
  button text). Flipped to dark `#06231A` = **5.3:1** ✅ (accent stays forest for icons/numbers).
  Known marginals left for the `[a11y]` pass: small *colored* text on cards (`green` on `card` ≈
  4.4:1, `streakText`/`recentNote`) is just under 4.5 for ≤13pt regular — fixing means either
  brightening the accent (changes the chosen forest look) or darkening cards, a design call the
  `[a11y]` item owns. Everything else (primary text 14.8:1, `textDim` 4.5–5.9:1, `error` 5.7:1,
  savings-card text 7.2:1) passes AA.
