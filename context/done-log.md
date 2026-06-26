# Done-log — the ledger (what was asked, what shipped)

Append-only, **reverse-chronological** record that closes the tracking loop: after a batch
of work it's easy to forget *what you asked for* and *what actually got done*. This file is
the one place both live, stamped with a date.

- **`/inbox`** appends an **ASKED** block — the raw batch + where each item was routed.
- **`/fire`** appends a **SHIPPED** block — each item it closed, with the branch.
- **`/wtf`** reads this (plus `roadmap.md` / `SKILLS_TODO.md`) to print the catch-up / open-vs-done digest.

Open work still lives in `context/roadmap.md` + `.claude/skills/SKILLS_TODO.md`; per-area detail
stays in each `context/features/<area>.md` **Fix log**. This ledger is the chronological index
over all of it — never delete entries, only add.

> Format: newest at the top. `ASKED` = an intake batch. `SHIPPED` = completed work.

---

## 2026-06-26 — ASKED (batch: "per-batch archive for done-vs-todo tracking")
Routed via `/inbox` → one SKILLS_TODO design item. Marketplace checked (`npx skills find`):
no skill clears the trust bar — only git `changelog-generator`s (≤115 installs), which diff
git history rather than track todo/done by category+date. Build in-house.
- → SKILLS_TODO `[archive-tracking]` — design `archive/<category>/<date>/<batch>` per-batch archive; reconcile with (not duplicate) the existing done-log + Fix-log + `/wtf` loop. Deferred design → likely `/skill-forge`.

## 2026-06-26 — ASKED (batch: "wtf on new skills + cross perf skill against our code")
Routed via `/inbox` → one SKILLS_TODO doc task, one new roadmap **🔍 Audits** section + item.
Also restructured roadmap sections: added **🔍 Audits** (skill-driven sweeps), renamed
**🧹 Reorg / tech debt** → **🧹 Tech debt**.
- → SKILLS_TODO `[skills-explainer]` — persistent cheat-sheet for the new skills (perf / ui-design / caveman / wtf / skill-forge / skill-doctor)
- → roadmap `[perf]` (🔍 Audits) — whole-app render audit: run `expo-react-native-performance` + `app-ui-design` across `src/` + `packages/` to catch render/best-practice issues

## 2026-06-26 — SHIPPED (branch `skill_testing_02_skills-refactor`)
- ✅ `[refactor]` — slimmed the messy SKILL.md files. The repeated house-rules (LSP-over-grep,
  never-`any`, verify=tsc+lint, branch/commit) now live once in **SKILLS_README → House rules**;
  each skill points there instead of restating. Tightened `fire`/`polish`/`inbox`, standardized
  `list-components`, and synced `inbox` to reality (skills-items → `SKILLS_TODO`, app-items →
  roadmap; logs the `ASKED` ledger block). Net: noticeably shorter, single source for the rules.

## 2026-06-25 — SHIPPED (branch `skill_testing_01_tracking-loop`)
- ✅ `[tracking]` — task-tracking loop **v1**: this `context/done-log.md` ledger + new `/recall`
  skill (open-vs-done digest) + `/inbox` & `/fire` wired to append `ASKED`/`SHIPPED` blocks.
  Registered `/recall` in `SKILLS_README.md`; `[tracking]` marked `[~]` in `SKILLS_TODO.md`
  (v2 idea: per-item IDs). Commit `e24dada`.

## 2026-06-25 — ASKED (batch: "skills next level")
Routed via `/inbox` → mostly `.claude/skills/SKILLS_TODO.md` (skills-system), one app bug → `roadmap.md`.
- → SKILLS_TODO `[marketplace]` — adopt skills.sh / skill-creator
- → SKILLS_TODO `[strategy]` — keep ours + marketplace skills both
- → SKILLS_TODO `[refactor]` — slim the SKILL.md files (progressive disclosure)
- → SKILLS_TODO `[new-skill]` — render-audit / performance skill
- → SKILLS_TODO `[tracking]` — close the task-tracking loop ← **building now**
- → SKILLS_TODO `[scope]` — which skills this app needs
- → SKILLS_TODO `[portability]` — generic skills to user-level `~/.claude/skills/`
- → SKILLS_TODO `[new-skill]` — skill-creator to author new ones
- → SKILLS_TODO `[answer-format]` — per-question ✅/❌/⚠️ breakdown
- → roadmap `[inputs]` — iOS cursor jumps backwards when typing fast (audit all controlled TextInputs)
