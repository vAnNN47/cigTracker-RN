# Skills — how to use them

Project skills live in `.claude/skills/<name>/SKILL.md` and run as slash commands in
Claude Code. **Reload the VS Code window after adding or changing a skill.** There are five.

> New here? Read [SKILLS_TUTORIAL.md](SKILLS_TUTORIAL.md) first — the plain-English "what & when".

## The three-verb flow

The whole loop is three skills, one verb each:

```
  ideas off-PC ──► /inbox ──► roadmap.md (the open queue) ──► /fire <area> ──► built + logged
                                                                                    │
                                       before device-test / release: /polish ◄──────┘
```

- **`/inbox`** — INTAKE. Sort a brain-dump into the roadmap. Never writes code.
- **`/fire <area>`** — DO. Branch → build that area's roadmap items → verify once → log the fixes.
- **`/polish`** — POLISH. Pre-release hygiene: fix small mess + drain structural debt.

Plus two helpers: **`/list-components`** (inventory) and **`/package`** (reuse-first widgets).

> **Every skill that changes files runs on its own fresh branch and auto-commits at the end —
> no asking** (local-branch only: never push, never main). Each skill run = new branch → its
> change → commit, so a bad run is reverted or abandoned without touching any other branch.
> A report-only run (e.g. `/polish check`) changes nothing, so it neither branches nor commits.

> **Two house rules for any skill that touches code** (`/fire`, `/polish`, `/package new`):
> 1. **Prefer the LSP tool when it's available** — `goToDefinition` / `findReferences` / `hover`
>    for navigation + reference-finding instead of grep (and to confirm "zero references → safe to
>    delete"). Fall back to Grep if the LSP server isn't connected.
> 2. **Never write `any`** — type to what the code expects; `unknown`+narrowing is the only escape
>    hatch, never `as any` (see `context/coding-standards.md`).

---

## `/inbox [<paste your batch>]`
Sorts a raw brain-dump (Hebrew/English, numbered or not) into `context/roadmap.md`, tagged
by area, and **dedupes** against what's already open. Routing only — never writes code.

- `/inbox 1. no spinner on Today edit 2. more padding on sheet buttons …` — sort that batch
- `/inbox` (empty) — read and sort `context/inbox.md` if present

## `/fire <area> [merge]`
The one action skill. Cuts a branch, **builds** every open `[area]` item from the roadmap,
verifies **once** at the end (`tsc` + lint), then moves each finished item to that area's
**Fix log**. Replaces the old `feature start` + `feature fix` split — no "shall I start?" gate.

- `/fire today` — branch + build all open `[today]` items + verify + log
- `/fire today merge` — merge the finished branch into its parent (never main automatically)

## `/polish [check|run]`
The pre-release pass. Run when you're about to device-test or ship — **not** after every task.
Merges the old `/cleanup` + `/tech-debt`: Phase 1 clears small mess, Phase 2 drains the
roadmap's **🧹 Reorg / tech debt** items.

- `/polish` or `/polish check` — report only, change nothing
- `/polish run` — fix trivial mess (you pick), then drain structural debt one item at a time

## `/list-components [subdir]`
Lists component files under `src/components/` (and notes reusable ones in `packages/`) with a
one-line description each. `/list-components drawers` scopes to a subfolder.

## `/package [list|check <need>|new <name>]`
The reuse-first workflow for `packages/` (app-agnostic, portable components).
- `/package list` — list packages with their README one-liner
- `/package check keyboard-aware bottom sheet` — is there already a package (or installed lib)?
- `/package new slide-drawer` — scaffold `packages/slide-drawer/`

---

## The context system these use

| File | Purpose |
|------|---------|
| `context/roadmap.md` | **The single open queue** — ALL open bugs/improvements/tech-debt, tagged `[area]` |
| `context/features/<area>.md` | Per-area **context + dated Fix log** — *not* open items (those live in the roadmap) |
| `context/features/_template.md` | Copy this to start a new feature doc |
| `context/current-feature.md` | Optional "working on this right now" pointer |

**One source of truth:** an item is **open in the roadmap**, then `/fire` **moves it to the
area doc's Fix log** when done. It is never in two places at once.

**Typical flow:** `/inbox` your notes → scan `roadmap.md` → `/fire <area>` to build + close its
items → `/polish` before you device-test or release.

### Naming convention (kebab area-tags)

- **One feature doc per *area you'd cut a branch for*** — a tab, a sheet, a drawer — **not** one
  per component file or button. A button tweak is a roadmap line tagged with that area.
- **The tag is a kebab-case slug** you type (`today`, `settings`, `sheets`, `slide-drawer`). It's
  a handle, not a filename — the `# H1` inside the doc is the pretty label (`today.md` → `# Today tab`).
- **The roadmap `[tag]` equals the doc slug.** `[sheets]` ↔ `sheets.md`. That one-word match is
  the glue: `/fire <slug>` reads the `[slug]` roadmap lines and writes the `<slug>.md` Fix log.
- **Add the *kind* to the slug only when it disambiguates** (`edit-log-sheet`, `slide-drawer`).
- Granularity test: *"Would I open a branch for this thing?"* Yes → its own slug/doc. No → a
  roadmap line under the bigger thing's tag.
