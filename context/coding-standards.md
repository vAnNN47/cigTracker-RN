# Coding Standards

## TypeScript
- Strict mode is on. **Never use `any` — ever.** No `as any`, and never add a new
  `eslint-disable @typescript-eslint/no-explicit-any`. Always type to what the code actually
  expects. For a genuinely unknowable value (a `catch` error, an untyped third-party payload),
  use `unknown` and **narrow** it before use — `unknown` is the only escape hatch, never `any`.
- Define `interface`/`type` for all component props, repository methods, and data models.
- Prefer inference where obvious; add explicit types where they aid the reader.

## React Native components
- Functional components only; hooks for state and side effects.
- One job per component. Extract reusable logic into custom hooks (`src/hooks/`) and reusable UI into `src/components/` (or `packages/` if app-agnostic).
- Prefer composition over giant components. Keep functions under ~50 lines when reasonable.
- **`src/components/` is grouped by purpose** — put a new component in the matching subfolder (import as `@/components/<bucket>/<Name>`):
  - `ui/` — generic building blocks (e.g. `TabHeader`).
  - `charts/` — data-viz / SVG (`Ring`, `LineChart`).
  - `sheets/` — bottom-sheet flows (`AddSmokeSheet`, `AddPurchaseSheet`, `LogDetailSheet`).
  - `drawers/` — slide-in drawers (`SlideDrawer`, `MainDrawer`, `AccountDrawer`).
  - `feedback/` — transient feedback (`Toast`).
  - App-agnostic widgets don't go here at all — they live in `packages/`.

## Documentation comments (hover docs)
- Put a **one-line JSDoc** (`/** ... */`) above each exported component, hook, and non-trivial function — VS Code shows it on hover (like C# `///` XML docs).
- **Write it as you write the code, never as a later pass.** New exported code is not "done"
  (and not committed) without its one-line JSDoc — adding docs should never need to be its own task.
- Keep it to a single summary line. **No inline narration** of obvious code. Document *why*, not *what*, when a comment is needed.

```ts
/** Transient confirmation popup ("Saved", "Deleted"). Auto-dismisses after `duration`. */
export function Toast({ ... }) { ... }
```

## Styling
- React Native `StyleSheet.create` only. **No Tailwind, no NativeWind, no inline style objects** for anything reusable.
- All colors/fonts/spacing come from the **theme** (`useColors()`, `fonts`, spacing from `@/theme`). No hardcoded hex colors or magic spacing numbers in screens.
- Support **light and dark** by reading theme tokens, never literal colors.

## State & data
- **Zustand** (`src/store/`) is the single source of truth. UI reads/writes through the store.
- **Never call a repository directly from UI** — go through the store.
- Data access goes through the **`Repository` interface** ([src/data/repository.ts](../src/data/repository.ts)). Any new persistence need = add a method to the interface and implement it in *all* repos (AsyncStorage, Supabase, InMemory) so the seam stays intact.
- Pure business/date logic lives in `src/domain/` — no React, no I/O there.

## Navigation
- Routes are files under `src/app/` (expo-router). Adding a screen = adding a file; the folder structure *is* the nav graph.
- `(tabs)/` = bottom-tab screens; root-level files = full-screen sub-pages pushed over the tabs.

## Localization & RTL (required)
- **No hardcoded user-facing strings.** Every label comes from `useStrings()`; add new keys to `src/i18n/strings.ts`.
- Test changes in **both** Hebrew (RTL) and English (LTR). Use logical layout (start/end), not hardcoded left/right, and respect the helpers in `src/i18n/rtl.ts`.

## Naming
- Components & component files: **PascalCase** (`Ring.tsx`, `EditLogSheet.tsx`).
- Hooks: `useThing` (`use-color-scheme.ts` style for files is acceptable for hooks/utilities).
- Functions/variables: camelCase. Constants: SCREAMING_SNAKE_CASE. Types/Interfaces: PascalCase, no `I` prefix.
- **Feature-context docs** (`context/features/<slug>.md`): **kebab-case area slug** — one doc per
  *area you'd cut a branch for* (tab/sheet/drawer), not per component or button. The filename is a
  handle, not the component's filename; the `# H1` inside is the human label. The roadmap `[tag]`
  must equal the slug (`[sheets]` ↔ `sheets.md`). Add the kind to the slug only when it
  disambiguates (`edit-log-sheet`). See `.claude/skills/SKILLS_README.md`.

## Reusable packages
- If a component is **app-agnostic** (no CigTracker domain knowledge), build/extract it under `packages/<name>/` with its own `index.ts` + `README.md`, kept dependency-light so it can move to another project.

## Expo / RN specifics
- Target **Expo SDK 56 APIs** — check https://docs.expo.dev/versions/v56.0.0/ before using an Expo module; do not assume older signatures.
- Reach for the right library already in the project (reanimated, gesture-handler, svg, keyboard-controller) before adding new deps.

## Code quality
- No commented-out code, no unused imports/variables.
- `npx tsc --noEmit` must pass and `npm run lint` should be clean before a change is considered done.

## Don't write to repos we don't own (global; applies to ALL work and every skill)
- **Never post to, comment on, or open issues/PRs against third-party/upstream repos** (e.g. a
  plugin's GitHub), and never commit/push to any repo we don't own. **Research them read-only** —
  read their issues, PRs, and code to find answers (that's required; see the rule below) — but
  **writing to them is off-limits.**
- If a fix or finding belongs upstream, **tell the user and stop** — they decide whether to post it
  themselves. Don't draft-and-send on their behalf, even if they earlier said "sounds good."
- Our own commits stay **local, on our branch** — never pushed, never `main`/`master` automatically
  (see `ai-interaction.md`). AI/Claude attribution stays out of commit messages (also `ai-interaction.md`).

## Never guess — check the source first (global; applies to ALL work and every skill)
- **Never guess** a command, library, API, tool, or error cause. **Verify against the source
  before acting or answering** — and **check the actual repo FIRST** (its PRs, commits, the real
  files on disk) before reasoning from memory or generic docs. The answer is often already
  upstream (e.g. a missing registration file fixed in an open PR).
- **When hitting a bug: search the repo's OPEN *and* CLOSED issues + PRs first.** It may already
  be the known solution — adopt it instead of inventing a workaround.
- No hacked workarounds. Find the **proper, current (latest-year) best-practice** method; don't
  assume older API shapes (see the Expo-SDK-56 rule in `CLAUDE.md`). **A hack is the LAST option,
  used only after the user explicitly approves it.**
- **Prove, don't theorize** — run the script, pipe the hook, read the file. Empirical beats
  plausible. For a popular/active repo, assume the basic thing *can* work: a gap is config to
  find, not a dead end to route around. This is a standing rule — no skill re-asks it per run.

## Code navigation — LSP over grep (global; applies to ALL work and every skill)
- Use the **LSP tool** for anything about symbols: `goToDefinition`, `findReferences`, `hover`,
  `documentSymbol`, `workspaceSymbol`. Use `findReferences` to prove "zero references → safe to
  delete/rename/move" before doing it.
- **Grep is only for raw text patterns LSP can't express** — e.g. finding every `console.log`,
  a `TODO`, a string literal, a usage in a non-source file. Prefer LSP wherever it can answer.
- **If the LSP server isn't connected/working, STOP and notify the user — never silently fall
  back to grep** for symbol/reference work (grep loses the accuracy guarantee; the user wants to
  know the server is down). This is the standing rule — no skill needs to re-ask it per run.

## Verification = type-check + lint. The human does device checks.
- For any automated change, **"verify" means `npx tsc --noEmit` + `npm run lint`, both clean.**
  That is the whole gate Claude/a skill runs, once, at the end.
- **Device / emulator / web smoke-testing is the user's responsibility, not the skill's.** Don't
  claim to have device-tested, don't add "needs a device check" as a step you must perform, and
  don't block on it. Finish the tsc+lint gate → the automated part is done; the user runs the app
  and comes back with findings. (The one exception is the explicit `main`/`master` merge gate,
  where the *user* confirms they device-tested — see ai-interaction.md.)
