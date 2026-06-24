---
name: feature
description: Per-feature context docs + feature branching (start/merge, with main protected)
argument-hint: <name> [start | todo <text> | fix <text> | merge]
---

# /feature — per-feature docs + branching

Every app area (screen, tab, sheet, button, component) gets ONE living markdown doc at
`context/features/<name>.md` (open todos/problems · done · dated fix log). This skill
opens/updates those docs **and** manages the feature's git branch.

## Usage

| Command | What it does |
|---------|--------------|
| `/feature <name>` | Show that feature's doc (create from `_template.md` if missing). |
| `/feature <name> start` | Create the doc if needed, set Status "In Progress", and **cut a branch** off the current branch (see Branching). |
| `/feature <name> todo <text>` | Add an open todo/problem to the doc **and** `context/roadmap.md`. |
| `/feature <name> fix <text>` | Log a dated fix in the doc's **Fix log**, tick off the todo, remove it from `roadmap.md`. |
| `/feature <name> merge` | Merge the finished feature branch back into its **parent** branch (never main — see Branching). |

`<name>` is kebab-case: `settings`, `today`, `clock`, `slide-drawer`, …

## Steps

1. **Resolve the doc** `context/features/<name>.md`. If missing, copy `_template.md`, set the
   title, and fill **What / where**. Ask if you can't infer it.
2. **Apply the verb:**
   - `start` → set Status "In Progress"; create + checkout the branch (Branching, below); list the Open items to implement.
   - `todo <text>` → add a `- [ ]` under **Open**, mirror into `roadmap.md`.
   - `fix <text>` → move it to **Fix log** with **today's date** (YYYY-MM-DD), tick **Done**, delete from `roadmap.md`.
   - `merge` → see Branching.
3. Keep `roadmap.md` consistent (open items listed, resolved removed).
4. Print the doc's **Open** list and recent **Fix log**.

## Branching

- A feature is built on its **own branch**, cut from **the branch you're on now** (the parent).
- **Branch name:** `<current-branch>_<name>_<NN>` — `NN` is the next free 2-digit index, starting `01`.
  - e.g. on `dev_02`, `/feature clock start` → **`dev_02_clock_01`**.
- When the feature is 100% done, `merge` folds it back into the **parent** branch it was cut from; then offer to delete the feature branch.
- **🔒 main / master is protected.** NEVER merge or push to `main`/`master` automatically.
  Merging to main requires BOTH, in order:
  1. You confirm you **tested it on a real device** (iOS or Android), then
  2. an **explicit second go-ahead**.
  Until both happen, work stays on the dev-branch chain.

## Commits
Commit code yourself or ask me to. Conventional messages, **no AI attribution** (see ai-interaction.md).
