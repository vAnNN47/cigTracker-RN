# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

CigTracker is a cross-platform **Expo / React Native** cigarette-tracking app (Today / Diary / Community / Stats), bilingual **Hebrew (RTL) + English (LTR)**, with on-device or cloud storage. It was ported from an original Flutter app — that origin is historical only; the codebase is now 100% React Native.

## ⚠️ Read first — Expo version

@AGENTS.md

**Expo has changed.** This project is on **Expo SDK 56 / React Native 0.85 / React 19**. APIs differ from older SDKs you may know. Before writing Expo/RN code, consult the exact versioned docs: https://docs.expo.dev/versions/v56.0.0/ — do not assume older API shapes.

## Project context files

Read these for full project context:

- @context/project-overview.md — what the app is: features, screens, data model, tech stack
- @context/coding-standards.md — conventions and patterns to follow
- @context/ai-interaction.md — how we work together: workflow, branching, commits
- @context/roadmap.md — global list of all open bugs & problems
- @context/current-feature.md — what's actively in progress right now

Per-feature/component notes live in `context/features/<name>.md` (context + what's done + a dated fix log); open work lives in `context/roadmap.md` tagged `[area]`. Sort ideas in with `/inbox`, build an area with `/fire <area>`, tidy before release with `/polish`. See `.claude/skills/SKILLS_README.md` for how the skills work.

## Commands

Node is managed by **fnm** in the dev environment; if `node`/`npx` aren't found, activate fnm first (`fnm env --use-on-cd | Out-String | Invoke-Expression` in PowerShell). The Bash tool has no node — use PowerShell for node/expo/tsc.

- **Start dev server**: `npx expo start` (then press `a`/`i`, or scan for a dev build)
- **Run on Android**: `npm run android` (`expo run:android`)
- **Run on iOS**: `npm run ios` (`expo run:ios`)
- **Web**: `npm run web`
- **Typecheck** (primary "does it compile" gate — there is no web `build` step): `npx tsc --noEmit`
- **Lint**: `npm run lint` (`expo lint`)
- **Unit tests**: none configured yet (no Jest setup). "Verify" = typecheck + lint + run on a device/emulator.

A dev build with a separate identity (`CigTracker Dev` / `com.cigtracker.rn.dev`) installs alongside production — driven by `APP_VARIANT=development` in [eas.json](eas.json) via [app.config.js](app.config.js).

## High-level architecture

The app is a **layered architecture** under [src/](src/). Data flows: **UI (app/ + components/) → Zustand store → Repository → backend**.

- **`src/app/`** — expo-router file-based routes (this folder's structure IS the navigation). `(tabs)/` holds the 4 tabs (`index`=Today, `calendar`=Diary, `community`, `progress`=Stats); root-level routes are full-screen sub-pages (`settings`, `edit-log`, `purchases`). `_layout.tsx` files define navigators.
- **`src/store/`** — Zustand. [useAppStore.ts](src/store/useAppStore.ts) is the single source of truth: it owns the active `Repository`, raw data, and all writes. [useDrawerStore.ts](src/store/useDrawerStore.ts) drives the slide-in drawers. UI reads/writes only through the store, never the repository directly.
- **`src/data/`** — **Repository pattern.** [repository.ts](src/data/repository.ts) is the interface the whole app depends on; [createRepository.ts](src/data/createRepository.ts) maps a runtime `DataMode` to an implementation: `local` → AsyncStorage (on-device), `supabase` → cloud (requires Google sign-in), `null` → in-memory. **Swapping backends requires zero UI/store changes** — preserve this seam.
- **`src/domain/`** — pure business logic (daily counts, limits, savings math) in [logic.ts](src/domain/logic.ts) and day-bucketing in [day.ts](src/domain/day.ts). No React, no I/O. The "day" is offset by `AppSettings.dayStartHour` (e.g. 4am), so logs after midnight can count to the previous day.
- **`src/models/`** — domain types + product constants ([index.ts](src/models/index.ts)): `SmokeLog`, `Purchase`, `DailyLimit`, `AppSettings`, plus pack/carton math.
- **`src/i18n/`** — strings + RTL. All user-facing text comes from `useStrings()`; never hardcode strings. RTL/LTR is first-class (Hebrew + English) — see [rtl.ts](src/i18n/rtl.ts). Drawers and sub-screens slide from the layout's physical side.
- **`src/theme/`** — central design tokens (`useColors()`, `fonts`, `radius`, `spacing`). **Styling is NativeWind / Tailwind (`className`)** — tokens are ported to CSS in [global.css](src/global.css) and consumed via the `@/tw` wrappers; these JS tokens remain for inline cases className can't reach (icon/SVG colors, RN `Animated`, `SafeAreaView`, dynamic styles). See [features/styling.md](context/features/styling.md) for the cheatsheet.
- **`src/auth/`** — onboarding/login views; **`src/lib/`** — external clients (Supabase, Google auth, config).
- **`packages/`** (repo root, not under src) — self-contained, reusable, app-agnostic components extracted as mini-packages (each with its own README + `index.ts`): `keyboard-sheet`, `month-pager`, `number-pad`, `pull-refresh`. These are intended to be portable to future projects — keep them dependency-light and decoupled from app specifics.

Path alias: `@/*` → `src/*` (and `@/assets/*` → `assets/*`).
