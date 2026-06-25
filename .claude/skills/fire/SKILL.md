---
name: fire
description: Do one area end-to-end — branch, BUILD its roadmap items, verify once, log the dated fixes
argument-hint: <area> <branch>
---

# /fire — build an area, end to end

The one action skill. Pick an area and a branch name and `/fire` it: this cuts that branch, **actually
implements** that area's open items from the roadmap, verifies **once** at the end, and
closes the loop by moving each finished item to the area doc's Fix log. It replaces the old
`feature start` + `feature fix` split — there is no "shall I start?" gate and no half-done
hand-off; `/fire` goes all the way.

`<area>` is a kebab slug that matches a roadmap `[tag]`: `today`, `settings`, `sheets`,
`slide-drawer`, … — exactly what `/inbox` already writes (`**[edit-log]**` → `edit-log`).
`<branch>` is the name to give the new working branch.

## Usage

| Command | What it does |
|---------|--------------|
| `/fire <area> <branch>` | Cut branch `<branch>` → build every open `[area]` item from the roadmap → verify once → log dated fixes → commit. |
| `/fire <area> merge` | Merge the finished branch back into its **parent** (never main — see Branching). |

## Steps — `/fire <area> <branch>`

1. **Resolve context.** Open `context/features/<area>.md` (create from `_template.md`, set the
   `# H1` + **What / where**, if missing). Read every open `**[<area>]**` line in
   `context/roadmap.md` — that list is the work. If none, say so and stop.
2. **Branch.** Cut a new branch named `<branch>` (the second arg) off the branch you're on now
   (see Branching). If no branch name was given, fall back to the auto-name `<current>_<area>_NN`.
3. **BUILD all the items** — implement them for real, following `context/coding-standards.md`
   (store→repository seam, theme tokens, `useStrings`, RTL-safe, **a one-line JSDoc `/** */` on
   every new exported component/hook/function as you write it — never a later pass**, and **never
   `any`** — type to what the code expects; `unknown`+narrowing only when truly unavoidable, never
   `as any`). Use the **LSP tool** (`goToDefinition` / `findReferences` / `hover`) to navigate and
   understand code instead of grep. **If the LSP server isn't connected/working, STOP and notify
   the user — do NOT fall back to Grep.** Make **all** the edits; **do not** run typecheck/lint after each file.
4. **Verify ONCE, at the end** (not per file — Opus rarely typos and per-edit checks just burn
   tokens): run `npx tsc --noEmit` then `npm run lint` (PowerShell + fnm — see CLAUDE.md). Fix
   what breaks, then re-run the gate. **That is the whole gate — device / RTL+LTR checks are the
   user's job, not yours; don't perform or block on them** (see coding-standards.md → "Verification
   = type-check + lint").
5. **Close the loop.** For each item you actually finished: **remove it from `roadmap.md`** and
   add a dated line (`YYYY-MM-DD — what changed`) to the area doc's **Fix log** (and a `- [x]`
   under **Done** if it's a lasting capability). Items you didn't finish **stay** open in the
   roadmap — never tick something you didn't do. **Then append a `SHIPPED` block to
   `context/done-log.md`** (newest at top) listing each closed item + the branch — that ledger is
   what `/recall` reads, so the tracking loop stays intact.
6. **Report** what was built, the verify result, and any item left open. (The user will device-test
   and report findings — that's their job, not the skill's.) **Don't auto-run `/polish`** — hygiene
   is a separate, pre-release pass.
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
- **Branch name:** the `<branch>` you pass as the second arg. If you omit it, fall back to
  `<current-branch>_<area>_<NN>` — `NN` is the next free 2-digit index from `01`
  (e.g. on `dev_02`, `/fire clock dev_02_clock_01`, or just `/fire clock` → **`dev_02_clock_01`**).
- `/fire <area> merge` folds the finished branch back into its **parent**; then offer to delete it.
- **🔒 main / master is protected.** NEVER merge or push to `main`/`master` automatically.
  A main merge needs BOTH, in order: (1) you confirm it was **tested on a real device**, then
  (2) an **explicit second go-ahead**. Until both, work stays on the dev-branch chain.

## Not this skill's job
- Sorting a fresh brain-dump of ideas → `/inbox`.
- Pre-release hygiene (small mess + structural debt) → `/polish`.
