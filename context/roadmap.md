# Roadmap — all open bugs & problems

Global list of everything open across the app. Each item is tagged by feature and,
where one exists, links to its doc in [features/](features/). When something is
fixed it moves to that feature's **Fix log** (with a date) and leaves this list.

> This is the single open queue. Add items by sorting a brain-dump with `/inbox`; build + clear
> an area's items with `/fire <area>` (it moves each done item to that area's Fix log). Drain the
> **🧹 Tech debt** section with `/polish`. **🔍 Audits** = skill-driven sweeps (render-perf,
> ui-design, rtl/a11y) that surface findings — run the named skill, then file the fixes it finds.


## 🐞 Bugs

_(none open)_

## 🧩 Improvements

- [ ] **[theme]** Dark mode redesign — keep it dark but more modern, in the spirit of Discord's dark background, with green as the primary color. (דארק מוד מודרני בסטייל דיסקורד, ירוק primary)
- [ ] **[a11y]** Accessibility pass (from the `app-ui-design` cross, 2026-06-27). (1) **Screen-reader labels** — only Today's hero + FAB have `accessibilityLabel`; every other icon-only `Pressable` (calendar month arrows, settings/purchases back, edit pencils, purchase delete, drawer toggles, tab-bar buttons) has none → VoiceOver/TalkBack read nothing. Add `accessibilityLabel` + `accessibilityRole="button"` (strings via `useStrings`). (2) **Color-alone status** — calendar day under/over is conveyed by green/red fill only (WCAG 1.4.1); add a shape/icon cue. (3) **Touch targets** — progress range chips + the 32×32 nav buttons are below 44×44pt; ensure size or `hitSlop` covers it. (4) Verify `textDim`/placeholder contrast ≥4.5:1 in both themes + test large Dynamic Type for clipping in fixed-height rows. (נגישות — תוויות קורא-מסך, סטטוס לא-רק-בצבע, יעדי מגע)

- [ ] **[sheets]** Log copy action — make it a **plain clipboard copy**, not the OS share sheet. `LogDetailSheet`'s `copyAll` calls `Share.share(...)`; replace with `Clipboard.setStringAsync(...)` + a native snackbar/toast "Copied to clipboard" (`useStrings`, both themes/RTL). Copied text = the log's **comment + diary note only** (drop the `cigNumber · time` header line that's all it effectively yields today). (קופי טקסט — העתקה ללוח + סנאקבר, לא share)

## 🔍 Audits

_(none open — render audit drained; `app-ui-design` findings live as `[a11y]` + the `[theme]` token item)_

## 🧹 Tech debt

- [ ] **[styling]** Migrate styling from React Native `StyleSheet` → **NativeWind v5 (Tailwind v4 syntax)**, preserving the current design exactly. Big multi-screen refactor — staged on branch `nativewindv5_migration`. ⚠️ Reverses the current "No Tailwind/NativeWind" rule in `coding-standards.md` — update that standard as part of the migration. (See Expo's `expo:expo-tailwind-setup`.)
- [ ] **[theme]** Extract semantic color tokens (from the `app-ui-design` cross, 2026-06-27). Error red `#C0392B` is hardcoded in 4 files (`calendar` OVER_TEXT, `progress`/`settings`/`AddPurchaseSheet` `BAD`); plus under/over status rgba, `shadowColor "#1B2A4A"` (×3), `HIST_SOFT`, `feelChipSel` rgba, community avatar tints + `#FFFFFF` all bypass the theme — violating coding-standards' "no hardcoded hex". Add `error`, status (`underBg`/`overBg`/`overText`/…), and `shadow` tokens to `theme/` and replace the literals. Do this **with** the `[theme]` dark-mode redesign so the new tokens are themed once. (טוקני צבע סמנטיים — error/status/shadow במקום hex קשיח)
