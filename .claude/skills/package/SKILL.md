---
name: package
description: Reuse-first — check packages/ before building reusable UI, and scaffold new app-agnostic packages
argument-hint: list | check <need> | new <name>
---

# /package — the reusable-components workflow

`packages/` (repo root) holds **app-agnostic, dependency-light** components we extracted
because the big libraries didn't solve our exact problem (`keyboard-sheet`, `month-pager`,
`number-pad`, `pull-refresh`). Each is self-contained: `index.ts` + `README.md` + the
component. **Reuse from here before reinventing**, and put new reusable solutions here so
they travel to the next project.

## Usage

| Command | What it does |
|---------|--------------|
| `/package list` | List `packages/*` with each one's README one-liner. |
| `/package check <need>` | Before building reusable UI, scan `packages/` (and libs already installed) for something that already solves `<need>`; recommend reuse/extend, or "build new". |
| `/package new <name>` | Scaffold `packages/<name>/` following the existing convention. |

## `new` — scaffold convention
Create `packages/<name>/`:
- `<Name>.tsx` — the component. **No app imports** (no `@/…` paths, no CigTracker domain types). Props in, UI out.
- `index.ts` — `export * from "./<Name>";`
- `README.md` — what it solves, *why* (which big-lib gap it fills), a props table, and a usage snippet.

Keep it dependency-light — reuse libs already in the repo (reanimated, gesture-handler,
svg, keyboard-controller) before adding new ones.

## Rules
- **App-agnostic only.** If it knows about cigarettes / settings / the store, it belongs in
  `src/components/`, not here.
- **Reuse-first.** Never rebuild what a package already does — extend the package instead.
- These are meant to be portable to future projects: keep them decoupled and documented.
  (Good candidate to later move to `~/.claude/skills/` so every project gets this skill.)
