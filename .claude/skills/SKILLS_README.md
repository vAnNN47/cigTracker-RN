# Skills — how to use them

Project skills live in `.claude/skills/<name>/SKILL.md` and run as slash commands in
Claude Code. **Reload the VS Code window after adding or changing a skill.** There are five.

> **cleanup vs tech-debt:** `/cleanup` *finds* small mess and *files* the structural
> bits into `roadmap.md`; `/tech-debt` *executes* those structural items and clears
> them. cleanup fills the roadmap, tech-debt empties it.

---

## `/feature <name> [todo|fix <text>]`
Maintains the per-feature context docs in `context/features/`. Each app area gets ONE
living `.md` file: open todos/problems · what's done · a **dated fix log**.

- `/feature settings` — show (or create) the Settings doc
- `/feature settings todo language dropdown clips on small screens` — add an open problem (also lands in `roadmap.md`)
- `/feature settings fix count_down now written in the supabase upsert` — log a dated fix; removes it from `roadmap.md`

New docs are created from `context/features/_template.md`. Use a kebab-case name that
matches the area: `today`, `edit-log-sheet`, `slide-drawer`, `ring`, …

## `/cleanup [check|run]`
Housekeeping scan over the repo (console.logs, unused imports, stale `eslint-disable`,
orphan files, leftover Flutter refs, `.env` drift, context-vs-reality).

- `/cleanup` or `/cleanup check` — **report only**, changes nothing
- `/cleanup run` — fixes the trivial items you pick, and files structural findings into `roadmap.md`

## `/tech-debt [list|next|<item>]`
Works through the **🧹 Reorg / tech debt** items in `roadmap.md` — the bigger structural
changes (consolidations, folder reorgs, extracting a `packages/` component, lint triage).

- `/tech-debt list` — show the open tech-debt items
- `/tech-debt next` — implement the safest one (single focused change + `tsc` + own commit), then tick it off the roadmap
- `/tech-debt consolidate the two theme files` — implement a specific item

## `/list-components [subdir]`
Lists component files under `src/components/` (and notes reusable ones in `packages/`)
with a one-line description each. `/list-components drawers` scopes to a subfolder.

## `/package [list|check <need>|new <name>]`
The reuse-first workflow for `packages/` (app-agnostic, portable components).
- `/package list` — list packages with their README one-liner
- `/package check keyboard-aware bottom sheet` — is there already a package (or installed lib) for this?
- `/package new slide-drawer` — scaffold `packages/slide-drawer/` (component + `index.ts` + `README.md`)

---

## The context system these use

| File | Purpose |
|------|---------|
| `context/roadmap.md` | The single global list of ALL open bugs/problems |
| `context/features/<name>.md` | Deep per-area notes — todos, done, dated fixes |
| `context/features/_template.md` | Copy this to start a new feature doc |
| `context/current-feature.md` | Optional "working on this right now" pointer |

**Typical flow:** scan `roadmap.md` → open the area with `/feature <name>` → fix the code →
`/feature <name> fix <text>` to log it with today's date and clear it from the roadmap.
