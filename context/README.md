# Context

Project context for Claude + you. The always-on files are referenced by the root
`CLAUDE.md` and loaded each session; the per-feature docs are read on demand.

## Always-on
- `project-overview.md` — what the app is: features, screens, data model, tech stack
- `coding-standards.md` — conventions and patterns to follow
- `ai-interaction.md` — how we work together (workflow, branching, commits)
- `roadmap.md` — **global list of all open bugs & problems** (links to feature docs)
- `current-feature.md` — optional "what I'm actively focused on right now" pointer

## Per-feature docs — `features/`
ONE living doc per app area (screen / tab / sheet / drawer), holding its **context + a
dated fix log** — what it is, what's done, and what changed when. Open todos do **not**
live here; they live in `roadmap.md` tagged `[area]`. `/fire <area>` builds the roadmap
items and moves each finished one into that area's fix log. Copy `features/_template.md`
to start a new one. Examples: `features/settings.md`, `features/today.md`.

See `.claude/skills/SKILLS_README.md` for how the skills use these files.
