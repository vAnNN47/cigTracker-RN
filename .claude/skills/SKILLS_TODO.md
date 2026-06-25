# Skills TODO — backlog for the skills/workflow system

Ideas and tweaks for the **skills themselves** (`.claude/skills/*`) and the
`context/` workflow — NOT app bugs/features. Those live in `context/roadmap.md`;
this file is the separate queue so process-tweaks don't get mis-routed by
`/inbox` into the app roadmap.

> No skill auto-drains this. Action items here directly when you're tweaking the
> skill system (edit the relevant `SKILL.md` / context doc), then move the line to
> **Done** with a date.

## Open

- [ ] _(none)_

## Done

- [x] 2026-06-25 — Code-touching skills (`/fire`, `/polish`, `/package new`) now **prefer the LSP tool** (goToDefinition/findReferences/hover, and findReferences for "zero-reference → safe to delete") with Grep fallback. Added guidance to `fire`/`polish` SKILL.md + a house-rule in `SKILLS_README.md`. (LSP wired up this session via the vtsls plugin.)
- [x] 2026-06-25 — **Never `any`** baked into the skills + `coding-standards.md` (type to what the code expects; `unknown`+narrowing is the only escape, never `as any`). Existing-`any` purge + flipping the eslint rule to error is queued in the roadmap's tech-debt section.
- [x] 2026-06-25 — `/fire` auto-commits at the end on its own fresh branch (no ask, no push, never main). Updated `fire/SKILL.md` step 7 + `context/ai-interaction.md` (Workflow step 6 + Commits).
- [x] 2026-06-25 — **Every skill** (not just `/fire`) auto-commits on its own fresh branch, no asking; report-only runs (e.g. `/polish check`) don't branch/commit. Generalized in `context/ai-interaction.md` (Workflow 6 + Commits) + `SKILLS_README.md`.
- [x] 2026-06-25 — `/inbox` must **ASK before mapping**: clarify every ambiguous item (meaning + which specific element) before printing the routing map; the first code match is not the single source of truth (similar elements exist). Added an "Ask before you map" callout + a clarify-first step + a rule to `inbox/SKILL.md`. (Prompted by mis-mapping "Save/Cancel buttons" to the number-pad instead of the edit sheet.)
