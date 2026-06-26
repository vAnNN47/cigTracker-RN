---
name: fire
description: Do one area end-to-end — branch, BUILD its roadmap items, verify once, log the dated fixes
argument-hint: <area> <branch>
---

# /fire — build an area, end to end

The one action skill. Cuts a branch, **actually implements** an area's open roadmap items,
verifies once, and closes the loop. No "shall I start?" gate, no half-done hand-off.

`<area>` is a kebab slug matching a roadmap `[tag]` (`today`, `settings`, `sheets`, …) — exactly
what `/inbox` writes. `<branch>` is the new working branch's name.

> Follows the shared **House rules** (SKILLS_README → House rules): LSP-over-grep · never `any` ·
> verify = tsc+lint once · JSDoc as you write · own fresh branch + auto-commit, no push/main.
> Those live in `coding-standards.md` + `ai-interaction.md` (auto-loaded) — don't restate, just follow.

## Usage

| Command | What it does |
|---------|--------------|
| `/fire <area> <branch>` | Cut `<branch>` → build every open `[area]` item → verify once → log dated fixes → commit. |
| `/fire <area> merge` | Merge the finished branch into its **parent** (never main — see Branching). |

## Steps — `/fire <area> <branch>`

1. **Resolve context.** Open `context/features/<area>.md` (create from `_template.md` with its
   `# H1` + **What / where** if missing). The open `**[<area>]**` lines in `context/roadmap.md`
   are the work. None → say so and stop.
2. **Branch.** Cut `<branch>` off the current branch (see Branching). No name given → auto-name
   `<current>_<area>_NN`.
3. **Build all the items** for real, per `coding-standards.md`. Use the LSP tool to navigate.
   Make every edit; **don't** verify per-file.
4. **Verify once, at the end** — `tsc --noEmit` then lint (PowerShell + fnm, see CLAUDE.md). Fix
   and re-run. That's the whole gate.
5. **Close the loop.** For each finished item: remove it from `roadmap.md`, add a dated line to
   the area doc's **Fix log** (+ a `- [x]` under **Done** if it's a lasting capability), then
   append a `SHIPPED` block to `context/done-log.md` (newest on top) listing the closed items +
   branch — that ledger is what `/wtf` reads. Unfinished items **stay** open; never tick what
   you didn't do.
6. **Report** what was built, the verify result, and anything left open. Don't auto-run `/polish`.
7. **Commit** automatically on the working branch.

## Stale or mismatched items
If an item is already done, wrong, or doesn't reproduce, **say so and stop** — reconcile the
roadmap line (relabel/remove) instead of faking a fix.

## Branching
- Runs on its **own branch**, cut from the current one (the parent).
- **Name:** the `<branch>` arg; omitted → `<current>_<area>_<NN>` (`NN` = next free 2-digit index
  from `01`, e.g. on `dev_02`, `/fire clock` → `dev_02_clock_01`).
- `/fire <area> merge` folds the branch into its **parent**, then offers to delete it.
- 🔒 **main/master protected** — never merge/push there automatically (see ai-interaction.md).

## Not this skill's job
- Sorting a brain-dump → `/inbox` · Pre-release hygiene → `/polish` · Catch-up / open-vs-done → `/wtf`.
