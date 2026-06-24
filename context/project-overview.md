# CigTracker — Project Overview

🚬 A cross-platform mobile app to **track cigarette consumption, spending, and progress toward cutting down or quitting.**

---

## 📌 Core Idea

People trying to reduce or quit smoking need to *see* their habit honestly: how many per day, when, where, how it compares to a self-set limit, and how much money they're saving. CigTracker turns each cigarette into a quick log and feeds it back as live counts, calendar history, and savings stats — with a friendly bilingual (Hebrew/English) UI.

---

## 🧑‍💻 Users

| Persona | Needs |
| ------- | ----- |
| Quitter | A daily limit + a ring that shows remaining allowance |
| Cutter-down | Trends over time, location patterns, gentle accountability |
| Budget-watcher | Spend tracking + "money saved vs. baseline" |
| Hebrew speaker | Fully RTL, native-feeling Hebrew UI (also works in English LTR) |

---

## ✨ Core Features

### A) Today (home tab)
- Live count of today's cigarettes vs. the active daily limit (progress **Ring**).
- One-tap **log a cigarette** (with location tag, feeling/comment, optional diary note).
- Optional count-**down** mode (shows remaining allowance instead of count-up).

### B) Diary (calendar tab)
- Day-by-day history of logged cigarettes.
- Edit or delete past logs; correct the time of a late-logged entry.

### C) Stats (progress tab)
- Trends (line chart), location breakdown, spend, and **savings vs. a baseline** (cigs/day before the app).

### D) Community tab
- Social / shared element (in progress).

### E) Settings & Purchases
- Currency, price per pack, baseline/day, day-start hour, count-down toggle.
- Log **purchases** (packs/cartons + price) to drive spend + savings math.

### F) Data & accounts
- **Local mode**: everything stored on-device (AsyncStorage), no account.
- **Cloud mode**: synced via Supabase, requires Google sign-in.
- The user picks the mode; the rest of the app doesn't care which is active.

---

## 🗄️ Data Model

Defined in [src/models/index.ts](../src/models/index.ts). Plain TypeScript types (no ORM).

- **SmokeLog** — `{ id, smokedAt: Date, tag: LocationTag, comment, diary }`. One logged cigarette. `tag` = where (`home|work|car|social`); `comment` = how it felt; `diary` = optional note.
- **Purchase** — `{ id, unit: 'pack'|'carton', quantity, price, boughtAt }`. Drives spend/savings.
- **DailyLimit** — `{ id, limit, effectiveFrom }`. Effective-dated; full history kept so past days use the limit that was active then.
- **AppSettings** — `{ currencySymbol, pricePerPack, baselinePerDay, dayStartHour, countDown }`.

Product constants: 20 cigarettes/pack, 10 packs/carton (200/carton). `dayStartHour` (default 4am) defines when a "day" rolls over.

---

## 🧱 Tech Stack

| Category | Choice |
| -------- | ------ |
| Framework | **Expo SDK 56 / React Native 0.85 / React 19** |
| Language | TypeScript (strict) |
| Navigation | expo-router (file-based, `src/app/`) |
| State | Zustand (`src/store/`) |
| Local storage | `@react-native-async-storage/async-storage` |
| Cloud backend | Supabase (`@supabase/supabase-js`) |
| Auth | Supabase + Google Sign-In (`expo-auth-session`, `@react-native-google-signin`) |
| Styling | React Native `StyleSheet` + central theme tokens (**no Tailwind/NativeWind**) |
| Charts/graphics | `react-native-svg` |
| Animation/gestures | `react-native-reanimated`, `react-native-gesture-handler` |
| i18n | Custom strings + RTL (`src/i18n/`), `expo-localization` |
| Build/deploy | EAS (`eas.json`); dev variant installs alongside production |

---

## 🏛️ Architecture (data flow)

```
UI (src/app routes + src/components)
        │  reads/writes
        ▼
   Zustand store (src/store/useAppStore)   ◄── owns the active Repository
        │
        ▼
   Repository interface (src/data/repository.ts)
        │  createRepository(mode)
        ├── AsyncStorageRepository   (mode: "local")
        ├── SupabaseRepository       (mode: "supabase")
        └── InMemoryRepository       (mode: null, placeholder)

   Pure logic (src/domain) is called by store/UI; no React, no I/O.
```

The **Repository interface is the key seam**: any backend that implements it drops in with zero UI/store changes.

---

## 🌍 Localization & RTL

First-class **Hebrew (RTL) + English (LTR)**. All visible text flows through `useStrings()`; layout, drawers, and sub-screen transitions respect the physical side of the active direction.

---

## 📦 Reusable packages

`packages/` (repo root) holds app-agnostic components extracted for reuse across future projects: `keyboard-sheet`, `month-pager`, `number-pad`, `pull-refresh`. Each is self-contained with its own README.

---

## 📌 Status

Actively developed. Current focus: design polish (light/dark themes), codebase reorganization, and the drawer/bottom-sheet UX. See [current-feature.md](current-feature.md).
