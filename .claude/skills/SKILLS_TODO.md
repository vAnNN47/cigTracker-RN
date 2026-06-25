# Skills TODO — backlog for the skills/workflow system

Ideas and tweaks for the **skills themselves** (`.claude/skills/*`) and the
`context/` workflow — NOT app bugs/features. Those live in `context/roadmap.md`;
this file is the separate queue so process-tweaks don't get mis-routed by
`/inbox` into the app roadmap.

> No skill auto-drains this. Action items here directly when you're tweaking the
> skill system (edit the relevant `SKILL.md` / context doc), then move the line to
> **Done** with a date.

## Open
- [ ] polish check should use LSP also, because when claude checks he uses grep again.

### Skills marketplace + "next level" (batch 2026-06-25)
- [ ] **[marketplace]** Learn/adopt skills.sh (Anthropic's skill marketplace — the user called it "Vercel skills") — pull `skill-creator` + any generic skills into `.claude/skills/`; ours and marketplace skills coexist. (איך להשתמש בסקילס מהמרקטפלייס)
- [ ] **[strategy]** Keep BOTH our workflow skills (inbox/fire/polish) **and** marketplace capability-skills — don't replace; layer marketplace skills under our flow. (להשאיר חלק שלנו חלק מהמרקטפלייס)
- [ ] **[new-skill]** Build a **render-audit / performance** skill — checks for unnecessary re-renders (memo/useCallback/stable keys/store selectors), ties into React DevTools Profiler / `expo-observe`. (סקיל שבודק כמות רינדורים ומשפר)
- [~] **[tracking]** Close the task-tracking loop — after a batch it's hard to recall what was asked vs done. **v1 built (2026-06-25, branch `skill_testing_01_tracking-loop`):** `context/done-log.md` ledger (ASKED + SHIPPED) + new `/recall` skill + `/inbox`&`/fire` wired to append. Possible v2: per-item IDs in the roadmap. (קשה לעקוב מה בוצע / מה רציתי)
- [ ] **[scope]** Decide which skills THIS app's scope needs (render-audit, rtl-audit, a11y, theme/token-consistency, repo-interface-parity). (איזה סקילס צריך לסקופ של האפ)
- [ ] **[portability]** Make generic skills project-agnostic and move them to **user-level `~/.claude/skills/`** (apply to all projects); keep project-glue skills (inbox/fire/polish, which reference this repo's `context/`) in the repo. (סקילס סט גנרי לכל הפרויקטים)
- [ ] **[new-skill]** Use `skill-creator` to author new custom skills to a higher standard; pull a design skill + an RN best-practices/render skill from the marketplace. (skill-creator — לעלות שלב)
- [ ] **[answer-format]** Every skill, on a batched/question input, must answer with a **per-question breakdown** (not schematic): split the questions out, ✅ = known+answered, ❌ = couldn't solve, ⚠️ = answerable-but-unsure / unsure-but-likely. (פורמט תשובות לבאטצ׳ שאלות)

## Done

- [x] 2026-06-26 — **[refactor]** Slimmed the SKILL.md files — collapsed the repeated house-rules (LSP/no-any/verify/commit) into one canonical **SKILLS_README → House rules** section every skill now points to; tightened `fire`/`polish`/`inbox` prose; standardized `list-components`. Also synced `inbox` to reality (routes skills-items → `SKILLS_TODO`, app-items → roadmap; logs the `ASKED` ledger block). Branch `skill_testing_02_skills-refactor`.
- [x] 2026-06-25 — Code-touching skills (`/fire`, `/polish`, `/package new`) now **prefer the LSP tool** (goToDefinition/findReferences/hover, and findReferences for "zero-reference → safe to delete") **no Grep fallback** — if the LSP server isn't working the skill STOPS and notifies the user. Added guidance to `fire`/`polish` SKILL.md + a house-rule in `SKILLS_README.md`. (LSP wired up this session via the vtsls plugin.)
- [x] 2026-06-25 — **Never `any`** baked into the skills + `coding-standards.md` (type to what the code expects; `unknown`+narrowing is the only escape, never `as any`). Existing-`any` purge + flipping the eslint rule to error is queued in the roadmap's tech-debt section.
- [x] 2026-06-25 — `/fire` auto-commits at the end on its own fresh branch (no ask, no push, never main). Updated `fire/SKILL.md` step 7 + `context/ai-interaction.md` (Workflow step 6 + Commits).
- [x] 2026-06-25 — **Every skill** (not just `/fire`) auto-commits on its own fresh branch, no asking; report-only runs (e.g. `/polish check`) don't branch/commit. Generalized in `context/ai-interaction.md` (Workflow 6 + Commits) + `SKILLS_README.md`.
- [x] 2026-06-25 — `/inbox` must **ASK before mapping**: clarify every ambiguous item (meaning + which specific element) before printing the routing map; the first code match is not the single source of truth (similar elements exist). Added an "Ask before you map" callout + a clarify-first step + a rule to `inbox/SKILL.md`. (Prompted by mis-mapping "Save/Cancel buttons" to the number-pad instead of the edit sheet.)
