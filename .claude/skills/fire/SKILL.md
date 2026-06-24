---
name: fire
description: Do one area end-to-end — branch, BUILD its roadmap items, verify once, log the dated fixes
argument-hint: <area> [merge]
---

# /fire — build an area, end to end

The one action skill. Pick an area and `/fire` it: this cuts a working branch, **actually
implements** that area's open items from the roadmap, verifies **once** at the end, and
closes the loop by moving each finished item to the area doc's Fix log. It replaces the old
`feature start` + `feature fix` split — there is no "shall I start?" gate and no half-done
hand-off; `/fire` goes all the way.

`<area>` is a kebab slug that matches a roadmap `[tag]`: `today`, `settings`, `sheets`,
`slide-drawer`, …

## Usage

| Command | What it does |
|---------|--------------|
| `/fire <area>` | Branch → build every open `[area]` item from the roadmap → verify once → log dated fixes. |
| `/fire <area> merge` | Merge the finished branch back into its **parent** (never main — see Branching). |

## Steps — `/fire <area>`

1. **Resolve context.** Open `context/features/<area>.md` (create from `_template.md`, set the
   `# H1` + **What / where**, if missing). Read every open `**[<area>]**` line in
   `context/roadmap.md` — that list is the work. If none, say so and stop.
2. **Branch.** Cut a branch off the branch you're on now (see Branching). 
3. **BUILD all the items** — implement them for real, following `context/coding-standards.md`
   (store→repository seam, theme tokens, `useStrings`, RTL-safe). Make **all** the edits;
   **do not** run typecheck/lint after each file.
4. **Verify ONCE, at the end** (not per file — Opus rarely typos and per-edit checks just burn
   tokens): run `npx tsc --noEmit` then `npm run lint` (PowerShell + fnm — see CLAUDE.md). Fix
   what breaks, then re-run the gate. Flag that the change still needs a **device check in both
   Hebrew (RTL) + English (LTR)** — you can't do that headlessly.
5. **Close the loop.** For each item you actually finished: **remove it from `roadmap.md`** and
   add a dated line (`YYYY-MM-DD — what changed`) to the area doc's **Fix log** (and a `- [x]`
   under **Done** if it's a lasting capability). Items you didn't finish **stay** open in the
   roadmap — never tick something you didn't do.
6. **Report** what was built, the verify result, what still needs a device test, and any item
   left open. **Don't auto-run `/polish`** — hygiene is a separate, pre-release pass.
7. **Commit automatically at the end**, on the working branch — `/fire` always runs on a
   fresh branch cut from the parent, so an auto-commit can never harm the parent or any older
   branch. Conventional message, **no AI attribution**. **Never `push`** and **never commit to
   `main`/`master`** (see Branching) — committing is local-branch only.

## Stale or mismatched items
If, while building, you find an item is already done, wrong, or doesn't reproduce, **say so and
stop** rather than inventing a change. Reconcile the roadmap line (relabel/remove) instead of
faking a fix.

## Branching

- A `/fire` runs on its **own branch**, cut from **the branch you're on now** (the parent).
- **Branch name:** `<current-branch>_<area>_<NN>` — `NN` is the next free 2-digit index from `01`
  (e.g. on `dev_02`, `/fire clock` → **`dev_02_clock_01`**).
- `/fire <area> merge` folds the finished branch back into its **parent**; then offer to delete it.
- **🔒 main / master is protected.** NEVER merge or push to `main`/`master` automatically.
  A main merge needs BOTH, in order: (1) you confirm it was **tested on a real device**, then
  (2) an **explicit second go-ahead**. Until both, work stays on the dev-branch chain.

## Not this skill's job
- Sorting a fresh brain-dump of ideas → `/inbox`.
- Pre-release hygiene (small mess + structural debt) → `/polish`.
