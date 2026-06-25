---
name: recall
description: Digest of what's open vs what shipped — never lose track of a batch you asked for
argument-hint: "[area | since <date>]"
---

# /recall — what did I ask for, and what got done?

You give work in **batches** and later can't recall what was asked vs what shipped. `/recall`
reads the project's tracking files and prints one **open-vs-done digest**, grouped by area, so
the loop is never lost. It **writes no code and no files** — read-only reporting. (The ledger it
reads is maintained by `/inbox` and `/fire`; see `context/done-log.md`.)

## Usage

| Command | What it shows |
|---------|---------------|
| `/recall` | Full digest: everything OPEN (roadmap + SKILLS_TODO) and everything SHIPPED recently (done-log), by area. |
| `/recall <area>` | Scope to one area slug (`today`, `inputs`, `sheets`, …). |
| `/recall since <date>` | Only ledger activity on/after `YYYY-MM-DD`. |

## Sources (read these, in order)
1. `context/done-log.md` — the chronological ledger (ASKED batches + SHIPPED work).
2. `context/roadmap.md` — open app bugs / improvements / tech-debt, tagged `[area]`.
3. `.claude/skills/SKILLS_TODO.md` — open skills/workflow items (separate queue).
4. `context/features/<area>.md` **Fix log** — per-area dated detail (only when scoping to an area).

## Steps
1. **Read** the sources above (use the dedicated Read/Grep tools, not shell).
2. **Build the digest** with three sections:
   - **🟢 Shipped recently** — from `done-log.md` SHIPPED blocks (newest first; respect `since`).
   - **🟡 Open — app** — unchecked `- [ ]` lines in `roadmap.md`, grouped by `[area]`.
   - **🔵 Open — skills/workflow** — unchecked lines in `SKILLS_TODO.md`.
3. **Reconcile loose ends** — if an ASKED item in the ledger is neither still open nor in a
   SHIPPED block, flag it ⚠️ "asked but unaccounted for" so nothing silently vanishes.
4. **Print** the digest. If `<area>` was given, filter every section to that slug and also show
   that area's Fix-log tail. Keep it scannable — counts per area, one line per item.

## Rules
- **Read-only.** `/recall` never edits files, never commits, never branches. It's a report.
- **Don't re-derive from git** — the ledger + roadmap are the source of truth; mention a commit
  only if it explains a discrepancy.
- The digest is a *map*, not a plan — don't start building. To build, the user runs `/fire`.

## Not this skill's job
- Routing a fresh brain-dump → `/inbox`.
- Building an area's items → `/fire <area> <branch>`.
- Pre-release hygiene → `/polish`.
