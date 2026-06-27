# Skills TODO — skills/workflow open queue

Open items for the **skills system** (`.claude/skills/*` + the `context/` flow) — NOT app work
(that's `roadmap.md`). Shipped items **leave** for the monthly archive
(`context/archive/YYYY/MM-month.md`, tagged `[skills][slug]`).

> **Item format:** a **plain one-liner** anyone gets, then `—`, then the detail. **Every open item
> has a UNIQUE `[slug]`** (unlike roadmap `[area]` tags, which repeat). How the system works →
> `.claude/skills/SKILLS_README.md`.

## Open

- [ ] **[inbox-skill-check]** **Every time /inbox gets a new dump, it should check each topic against the skills we already have — if a skill fits, tell me to use it; if none fits, say so and discuss whether one's worth building.** — Add a step to `/inbox`: for each item, scan the existing skills (`.claude/skills/*` + `SKILLS_TODO`) for an already-fitting skill; recommend it if found, else flag "no skill found" and discuss whether it warrants a new skill.
- [ ] **[verify-gate]** **Make the always-perfect "does it compile + is the lint clean" check a reusable skill I can drop into any app.** — Extract the tsc+lint verify gate (today it's baked as a step inside `/fire` + `/polish`, not a standalone skill) into a portable claude-kit skill. Must **auto-detect each project's gate** from `package.json` scripts (`typecheck`/`lint`/`test`, or the framework) instead of hardcoding `tsc`/`expo lint`. Related to [skills-portability] (that one *moves* custom skills; this one *builds* the gate skill).
- [ ] **[skills-portability]** **A way to take my personal skills (the ones that aren't part of the standard skills set) to a new project — push them to a repo or otherwise share them — because I'm starting a new app soon.** — Figure out how to package/publish the custom skills (separate from the shared `skills.sh` set) into a portable repo so they can be reused on the next app. Decide the mechanism (git repo, symlink, copy script) and document it.
