---
name: skill-forge
description: Build one SKILLS_TODO item end-to-end — pick it, author/tweak/adopt the skill, load-check, move it to Done. The /fire-for-skills drainer; the only thing that empties SKILLS_TODO.md.
argument-hint: <todo-item>
---

# /skill-forge — build a SKILLS_TODO item, end to end

The **drainer** for the skills backlog — the exact twin of `/fire`, but its queue is
`.claude/skills/SKILLS_TODO.md` instead of `roadmap.md`. It picks one open item, **builds it for
real**, load-checks it, and **moves the line to Done with a date**. No "shall I start?" gate.

`<todo-item>` is a tag or a few words matching an open `- [ ]` line (e.g. `caveman`, `polish-check`,
`render-audit`). Empty → list the open items and ask which to forge.

> **Why this exists:** `/inbox` fills `SKILLS_TODO`, `/skill-doctor` *audits/scans/criss-crosses* the
> skill set, and `/skill-creator` is the *engine* for authoring one skill well — but nothing **drained
> the queue**. This is that missing rung. It can't be a marketplace skill: closing an item means
> moving *your* `SKILLS_TODO` line, which only a repo-aware skill can do.

> Follows the shared **House rules** (SKILLS_README → House rules): own fresh branch + auto-commit,
> no push/main. **No `tsc`/app code** — this skill only touches `.claude/skills/*` + `context/` docs,
> so its gate is the **load-check** below, not tsc+lint.

## Steps — `/skill-forge <todo-item>`

1. **Resolve the item.** Read `SKILLS_TODO.md`; find the matching open `- [ ]` line under **Open**
   (or a batch section). No match → say so and stop. Already done/stale → reconcile the line
   (relabel/strike), don't fake it.
2. **Classify it** — this decides *how* you build:
   | Kind of item | How to build it |
   |---|---|
   | **New skill** (`[new-skill]`) | Author `.claude/skills/<name>/SKILL.md` in house style. For a skill with **objectively verifiable output**, offer to run **`/skill-creator`**'s draft→eval→iterate loop (it's the rigorous engine). For workflow-glue/subjective skills, author directly — say so and skip the eval machinery. |
   | **Tweak** (`[docs]`, `[polish-check]`, framing) | Edit the relevant `SKILL.md` / `SKILLS_README` / context doc directly. |
   | **Marketplace adopt** (`[marketplace]`) | `npx skills add <owner/repo> --skill <name> --agent claude-code -y` (see the Done log for the pattern; discover with `npx skills find <query>`). Record the **security scan** (Gen/Socket/Snyk) in the Done line. |
3. **Branch.** Cut a fresh branch off the current one, named `<current>_forge_<slug>` (or a name you
   pass). Skills-system edits this session may instead ride the current branch — match what the
   surrounding work is doing; never `main`.
4. **Build it for real** — the whole item, following SKILLS_README's frontmatter rules (`name` ==
   folder, `description`/`argument-hint` are strings, a bracketed hint is quoted) and the
   three-verb-flow tone. Add a **"Not this skill's job"** footer to any new skill.
5. **Load-check (the gate).** Re-read the frontmatter of every `SKILL.md` you touched: it must load
   — `name` equals its folder, `description`/`argument-hint` are strings, bracketed `argument-hint`
   quoted. (No tsc — these are docs.) **Reload the VS Code window** note applies for the user to see
   a new skill.
6. **Close the loop.** Move the item's `- [ ]` line to `## Done` in `SKILLS_TODO.md` as
   `- [x] <date> — …` describing what shipped. If a new skill landed, also add its row to the
   **Skill signatures** table in `SKILLS_README.md`. An item lives in exactly one place — open, then Done.
7. **Report + commit** — what you built, the load-check result, anything left open; auto-commit on
   the working branch (local only, never push/main).

## Unique-slug rule (when you add or relabel a SKILLS_TODO line)
Every `SKILLS_TODO` item carries a **unique `[slug]` tag** — no two open items may share one (unlike
roadmap `[area]` tags, which repeat by design). If you split, relabel, or add a line, give it its own
descriptive slug (`[caveman]`, `[render-audit]`, not a second `[marketplace]`/`[new-skill]`). No name
fits? Use `[cool-task]`, and if that's taken, number it `[cool-task-01]`, `[cool-task-02]`, …

## Stale or mismatched items
If the item is already done, wrong, or no longer wanted, **say so and stop** — fix the `SKILLS_TODO`
line instead of inventing work.

## Not this skill's job
- Sorting a brain-dump into the queue → `/inbox`.
- Inventory / overlap / framing critique / the /10 score → `/skill-doctor`.
- The rigorous draft→eval→trigger-optimize **engine** for one skill → `/skill-creator` (forge
  *delegates* to it for new objectively-testable skills; it doesn't replace it).
- Catch-up / open-vs-shipped digest → `/wtf`.
