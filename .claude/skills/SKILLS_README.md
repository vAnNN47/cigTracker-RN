# Skills — how to use them

Project skills live in `.claude/skills/<name>/SKILL.md` and run as slash commands in
Claude Code. **Reload the VS Code window after adding or changing a skill.**

> New here? Read [SKILLS_TUTORIAL.md](SKILLS_TUTORIAL.md) first — the plain-English "what & when".

## Authoring a skill — frontmatter rules (read before adding one)

A `SKILL.md` starts with YAML frontmatter. Get these right or the skill fails to load:

- `name:` — string, kebab-case, **must equal the folder name**.
- `description:` — string, one line (shown in the skill list).
- `argument-hint:` — **string** shown during `/` autocomplete. ⚠️ **A value starting with `[` is
  parsed by YAML as an array and breaks** ("argument-hint must be a string"). If your hint uses
  brackets, **quote the whole value**: `argument-hint: "[area] [format]"`. Bracket-free values
  (`<area> <branch>`, `check | run`) need no quotes.

> The real automated guard is `skill-creator` (skills.sh), which validates frontmatter on author —
> see the `[new-skill]` / `[marketplace]` items in `SKILLS_TODO.md`. Until then, follow the above.

## The three-verb flow

The whole loop is three skills, one verb each:

```
  ideas off-PC ──► /inbox ──► roadmap.md (the open queue) ──► /fire <area> ──► built + logged
                                                                                    │
                                                  before release: /polish ◄──────┘
```

- **`/inbox`** — INTAKE. Sort a brain-dump into the roadmap. Never writes code.
- **`/fire <area> <branch>`** — DO. Cut `<branch>` → build that area's roadmap items → verify once → log the fixes.
- **`/polish`** — POLISH. Pre-release hygiene: fix small mess + drain structural debt.

Plus helpers: **`/list-components`** (inventory), **`/package`** (reuse-first widgets), and
**`/recall`** (open-vs-done digest — closes the tracking loop over a batch).

## House rules (the shared rules every SKILL.md points to)

These are **not skill-local** — the canonical statements live in `context/coding-standards.md` +
`context/ai-interaction.md`, both **auto-loaded every session** by `CLAUDE.md`, so they apply to all
work with no re-asking. Each SKILL.md just references this section instead of restating them.

**Code-touching skills** (`/fire`, `/polish run`, `/package new`):
1. **LSP over grep** for symbols/references (`goToDefinition` / `findReferences` / `hover`; `findReferences` proves "zero refs → safe to delete"). Grep only for raw-text LSP can't express. **LSP down → STOP and notify; never fall back to grep.**
2. **Never `any`** — type to what the code expects; `unknown`+narrowing only, never `as any`.
3. **Verify = `tsc --noEmit` + lint, once at the end** (not per file). **Device / RTL+LTR checks are the user's job** — skills never device-test or block on it.
4. **JSDoc as you write** — every new export gets its one-line `/** */` immediately, never a later pass.

**Branch & commit** (all skills):
- Code-changing run → **its own fresh branch** (cut from current) → **auto-commit at the end, no asking.** Local only: **never push, never `main`/`master`.**
- Doc-only runs (`/inbox`, `/polish check`) stay on the **current branch** and auto-commit the doc edit there (no new branch — build straight off it).

---

## `/inbox [<paste your batch>]`
Sorts a raw brain-dump (Hebrew/English, numbered or not) into `context/roadmap.md`, tagged
by area, and **dedupes** against what's already open. Routing only — never writes code.

- `/inbox 1. no spinner on Today edit 2. more padding on sheet buttons …` — sort that batch
- `/inbox` (empty) — read and sort `context/inbox.md` if present

## `/fire <area> <branch>`
The one action skill. Cuts the branch you name, **builds** every open `[area]` item from the
roadmap, verifies **once** at the end (`tsc` + lint), then moves each finished item to that
area's **Fix log**. Replaces the old `feature start` + `feature fix` split — no "shall I start?" gate.

- `/fire today today-ring-fix` — cut `today-ring-fix` + build all open `[today]` items + verify + log
- `/fire today merge` — merge the finished branch into its parent (never main automatically)

## `/polish [check|run]`
The pre-release pass. Run when you're about to device-test or ship — **not** after every task.
Merges the old `/cleanup` + `/tech-debt`: Phase 1 clears small mess, Phase 2 drains the
roadmap's **🧹 Reorg / tech debt** items.

- `/polish` or `/polish check` — report only, change nothing
- `/polish run` — fix trivial mess (you pick), then drain structural debt one item at a time

## `/recall [<area> | since <date>]`
Read-only digest of **what's open vs what shipped**, so a batch of work is never lost. Reads the
ledger (`context/done-log.md`, maintained by `/inbox`+`/fire`) plus `roadmap.md` + `SKILLS_TODO.md`
and prints 🟢 shipped / 🟡 open-app / 🔵 open-skills, grouped by area. Writes nothing.
- `/recall` — full digest · `/recall today` — one area · `/recall since 2026-06-01` — recent only

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
