---
name: skills-help
description: Explain this project's skills — what each one does and how to use it, read live from the SKILL.md files. Use whenever the user asks what skills/commands exist, what a skill does, how to run one, which skill fits a task, or says they forget their slash commands.
argument-hint: "[skill-name]"
---

# /skills-help — what skills do I have, and how do I use them?

A read-only guide to the project's own skills. It reads each `.claude/skills/*/SKILL.md`
**live** (frontmatter + Usage), so the answer is always current — no hand-maintained list to
drift. Use it as the quick "what & how"; `SKILLS_TUTORIAL.md` is the longer plain-English read.

## Usage

| Command | What it shows |
|---------|---------------|
| `/skills-help` | A table of **every** skill: name · what it does · how to use (args + example). |
| `/skills-help <name>` | One skill in depth: what it does, when to reach for it, and its commands. |

## Sources (read these, don't guess)
1. `.claude/skills/*/SKILL.md` — every installed skill, including marketplace ones (the
   `skill-creator` symlink resolves here too). Pull `name`, `description`, `argument-hint` from
   frontmatter, and the Usage/`## Steps` table from the body.
2. `.claude/skills/SKILLS_README.md` — the three-verb flow + House rules, for grouping.

## Steps
1. **Glob** `.claude/skills/*/SKILL.md` and **Read** each (dedicated tools, not shell).
2. **No argument → the overview table.** One row per skill:

   | Skill | What it does | How to use |
   |-------|--------------|------------|

   - *What it does* = the frontmatter `description`, trimmed to one line.
   - *How to use* = the `argument-hint` plus the first concrete example from its Usage table.
   - Group by the three-verb flow first (`/inbox` → `/fire` → `/polish`), then helpers, so the
     shape of the system is obvious. End with a one-line pointer to `SKILLS_TUTORIAL.md`.
3. **`<name>` given → one skill in depth.** Read that skill's `SKILL.md` and explain, in plain
   language: what it does, *when to reach for it*, and each command with a real example. If no
   folder matches `<name>`, say so and list the available names.
4. **Print** it scannable. Don't dump whole SKILL.md bodies — distill.

## Rules
- **Read-only.** Never edits a skill, never commits, never branches — it only explains.
- **Read live; don't recite from memory.** A skill may have changed since you last saw it.
- Plain language over jargon — this is the "remind me how my own tools work" skill.

## Not this skill's job
- Auditing / scoring / critiquing the skills → `/skill-doctor`.
- Authoring or eval-improving a skill → `skill-creator`.
- Listing app components (`src/components/`) → that's gone; just ask Claude, or use `/package list`
  for `packages/`.
