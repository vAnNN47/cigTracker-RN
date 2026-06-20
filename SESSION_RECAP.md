# CigTracker RN — Session Recap (2026-06-20)

## ✅ Done this session

### 1. Calendar month swipe
- New reusable package **`packages/month-pager/`** (`MonthPager.tsx` + `index.ts` + `README.md`), matching the style of the other packages.
- Horizontal swipe between months with a native iOS-calendar feel:
  - **Flicker-free** — months sit at stable absolute slots keyed to a fixed anchor; only the translate animates, so committing a page never resets/swaps the page under your finger.
  - **No stuck on fast swiping** — the month change commits the instant the gesture ends (not in the animation callback), so rapid swipes each advance.
  - **RTL-aware**, future-gated (can't swipe past the current month, rubber-bands instead).
- Diary tab uses it via the package; the prev/next arrows now animate the slide too.

### 2. RTL / Hebrew layout fixes
- Added **`textStart`** helper in `src/i18n/rtl.ts`; applied across **Settings, Progress, Today, Diary**.
- Root cause: RN's `I18nManager.doLeftAndRightSwapInRTL` is ON by default and auto-flips explicit `left`/`right` in RTL — so we author as if LTR (`"left"`) and let RN mirror it to the right in Hebrew.
- Also fixed muted lines that start with a number/time (e.g. `01:25 · comment`) — `textAlign:auto` was left-aligning them; now explicit `textStart`.

## ⏭️ Next up (roadmap order)

3. **Persistent on-device repository** — AsyncStorage/SQLite as a third data mode so "use without an account" survives restarts. Foundational — unblocks onboarding.
4. **Welcome / onboarding screen** — intro the app, then choose "continue without registering" (local persistence) or Google sign-in (Supabase, shared multi-account data).
5. **Purchases history screen** — opened from Today's "Recent Purchase → View History"; purchases grouped by date with totals.

## 🕓 Still pending (later)
- Business-logic parity verification vs the original logic.
- Notifications (last).

## 📦 Build / release the iOS app
- Today you only run **dev builds** (`expo start --dev-client`).
- To produce a standalone / release iOS app, use **EAS Build** (Expo Application Services) — cloud builds, since the 2017 Intel Mac can't build SDK 56 locally. Pair it with **EAS Submit** to push to **TestFlight / App Store**.
- Requires an active **Apple Developer Program** membership ($99/yr).
- Heads-up: the EAS free tier caps builds per month (you noted ~15) — **verify the current limit** at expo.dev pricing before planning around it, since it changes.
- Typical commands (for next time): `eas build --platform ios --profile production`, then `eas submit -p ios`.

---
_Note: `tsc` couldn't be run cleanly this session — the sandbox file mount kept serving truncated copies. All edits were verified directly on disk; Metro bundles from disk, so the app is unaffected. Worth a real `tsc`/`expo-doctor` pass next session._
