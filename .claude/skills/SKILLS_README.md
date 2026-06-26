# Skills — how to use them

Project skills live in `.claude/skills/<name>/SKILL.md` and run as slash commands in
Claude Code. **Reload the VS Code window after adding or changing a skill.**

> New here, or back after days away? Run **`/wtf`** — it catches you up on the work AND the
> commands in one shot. Or read **The three-verb flow** + **A normal day** below.

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

Plus helpers: **`/wtf`** (the one "catch me up" button — open-vs-shipped work **+** how your
commands work, read live; the only refresher you need to remember),
**`/package`** (reuse-first widgets),
**`/skill-doctor`** (audits + scores the skill set itself), and
**`/skill-forge`** (the `/fire`-for-skills drainer — builds one `SKILLS_TODO` item to Done).

> Plus the marketplace **`skill-creator`** (installed under `.agents/skills/`, symlinked in): authors
> new skills and runs **empirical** evals / trigger-rate optimization to improve an existing one.
> `/skill-doctor` gives the cheap /10; hand a skill to `skill-creator` for the measured score.
>
> And the marketplace **`caveman`** — an output-prose compressor toggled by "caveman mode" /
> "less tokens" / `/caveman` ("stop caveman" to exit). Strips articles/filler/hedging from prose
> (~75% on prose), **code blocks + technical terms unchanged**. It trims *output* tokens; the LSP
> rule trims *input/context* tokens — orthogonal, so the real total saving is modest (best on long
> chatty turns, small on code-writing turns). Not always-on — invoke it when you want brevity.

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

**Answering a batched/multi-question input** (all skills):
- **Split the questions out and answer each on its own line** — never one schematic blob. Tag each
  with a confidence marker: **✅** = known + answered, **❌** = couldn't solve, **⚠️** =
  answerable-but-unsure / a best-guess. The reader must see per-item which got solved, which didn't,
  and where you're guessing. (Don't let the first code match stand in for the whole answer — similar
  elements exist; verify the specific one.)

---

## Skill signatures

Each skill's full body lives in its own `SKILL.md`, and **`/wtf <skill>` reads those live** — so
this table is just arg shapes, not a second copy of the prose.

| Skill | Args | One-line |
|-------|------|----------|
| `/inbox` | `[<batch>]` | Sort a brain-dump into `roadmap.md` (skills-items → `SKILLS_TODO.md`), dedupe. **No code.** |
| `/fire` | `<area> <branch>` · `<area> merge` | Branch → build all open `[area]` items → verify once (`tsc`+lint) → move to Fix log. |
| `/polish` | `check [file]` \| `run` | Pre-release: Phase 1 small mess + Phase 2 drain 🧹 tech-debt. `check`=report **+ queue** (doc-only commit); `check <file>` scopes the scan; skills-system findings route to `SKILLS_TODO.md`, app findings to `roadmap.md`. |
| `/wtf` | `[skill` \| `area` \| `since <date>]` | The "catch me up" button: open-vs-shipped work **+** how a command/area works. Read-only. No arg = full refresh. |
| `/package` | `list` \| `check <need>` \| `new <name>` | Reuse-first workflow for `packages/` (app-agnostic widgets). |
| `/skill-doctor` | `audit` \| `fix` | Audit/score (/10) the skill set itself. `audit`=read-only. |
| `/skill-forge` | `<todo-item>` | Drain one `SKILLS_TODO` item → build → load-check → move to Done. The `/fire` twin. |

> **Marketplace add-ons** (layered under the flow, don't replace it): `skill-creator` — authors
> skills + empirical eval/trigger-rate (the measured score `/skill-doctor` can't give);
> `caveman` — output-prose compressor (`/caveman`, "stop caveman" to exit);
> `expo-react-native-performance` — 42-rule Expo/RN perf guide (lists, animations, images, memo,
> profiler); **auto-triggers** when writing/reviewing RN components — this is our **render-audit**;
> `app-ui-design` — mobile UI design (iOS HIG + Material 3, a11y, color/type), for the dark-mode
> redesign. These are **capability** skills (do a job) — they sit *under* our workflow verbs
> (`/inbox`→`/fire`→`/polish`), never replace them.

## A normal day

1. Back at the PC → **`/inbox`** your phone notes.
2. Pick an area → **`/fire <area>`** (branches, builds, verifies, logs the fixes).
3. Device-test in **both** Hebrew (RTL) + English (LTR) → **`/fire <area> merge`**.
4. Before a release / when things feel messy → **`/polish`**.

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

### `SKILLS_TODO` slugs are UNIQUE (the one exception)

The above is the **roadmap** rule, where `[area]` tags **repeat** by design. `SKILLS_TODO.md` is the
opposite: **every open item carries a unique `[slug]` tag** — never two `[marketplace]` or two
`[new-skill]`. Each skills-item is a distinct task, so it gets its own descriptive slug (`[caveman]`,
`[skills-sh]`, `[render-audit]`). No name fits? Use `[cool-task]`, and if that's already taken,
number it: `[cool-task-01]`, `[cool-task-02]`, … `/inbox` (intake) and `/skill-forge` (drain) both
enforce this when they write a line.
