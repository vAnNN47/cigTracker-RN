# AI Interaction Guidelines

## Communication
- Be concise and direct.
- Explain non-obvious decisions briefly.
- Ask before large refactors or architectural changes.
- Don't add features that aren't in the spec / current-feature.
- Never delete files without clarification.

## Workflow

The common workflow for every feature/fix:

1. **Document** — capture the work in [current-feature.md](current-feature.md) (Goals, Notes).
2. **Branch + build + verify** — `/fire <area>` does steps 2–4 in one: it cuts a branch off the current branch (see Branching), builds the area's open roadmap items, and runs the verify gate once at the end.
3. **Implement** — (covered by `/fire`) build the goals one by one.
4. **Verify (automated gate)** — there is no web `build` step. A skill/Claude verifies by:
   - `npx tsc --noEmit` passes (no type errors), and
   - `npm run lint` is clean.
   That is the **whole** automated gate. **Device/emulator/web checks — including Hebrew (RTL) +
   English (LTR) — are the user's job, not the skill's.** The skill finishes at tsc+lint; the user
   runs the app and comes back with findings (see coding-standards.md → "Verification = type-check
   + lint"). The only place a device test is required is the `main` merge gate (Branching), where
   the *user* confirms it.
5. **Iterate** — adjust as needed.
6. **Commit** — every skill that changes files runs on **its own fresh branch** and
   **auto-commits** at the end (no ask, no push, never main). Worst case: revert the commit or
   switch back to the previous branch. (Outside a skill, still ask before committing.)
7. **Merge** — merge into the **parent** branch it was cut from. **Never** `main`/`master` automatically (see Branching).
8. **Delete branch** — after merge (ask first).
9. **Review** — review AI-generated code periodically and on demand.
10. Mark complete in [current-feature.md](current-feature.md) and append to History.

Do NOT commit until typecheck passes. If types fail, fix them first.

## Branching
- New branch per feature/fix, **cut from the branch you're on**. Name `<current-branch>_<area>_<NN>` (NN starts `01`) — e.g. on `dev_02`, area `clock` → `dev_02_clock_01`. Create it with `/fire <area> <branch>` (which then builds + verifies the area's items).
- Merge a finished feature into its **parent** branch; ask before deleting the branch once merged.
- **🔒 `main`/`master` is protected** — never merge or push there automatically. A main merge needs BOTH, in order: (1) you confirm you tested on a real device (iOS or Android), then (2) an explicit second go-ahead.

## Commits
- **Every skill auto-commits — no asking.** Each **code-changing** skill run = a **new branch**
  (cut from the current one) → its change → **auto-commit at the end**. A bad run can then be
  reverted or abandoned without harming any other branch (that isolation is the whole point).
  Auto-commit is **local-branch only**: never `push`, never `main`/`master`. *Outside* a skill,
  ask before committing.
- **Doc-only exception — commit on the current branch, no new branch.** Skills that change no app
  code — **`/inbox`** (routes into `context/roadmap.md`) and **`/polish check`** (appends `- [ ]`
  TODOs) — **auto-commit their doc edit on whatever branch you're on** (never asking), so you can
  build straight off it. Same no-push / never-`main` rule applies.
- Conventional commit messages (`feat:`, `fix:`, `chore:`, etc.).
- One feature/fix per commit; keep them focused.
- **Never** add AI/Claude attribution to commit messages — no `Co-Authored-By: Claude`, no "Generated with Claude" trailer.

## When Stuck
- If something isn't working after 2–3 attempts, stop and explain the issue.
- Don't keep trying random fixes.
- Ask for clarification when requirements are unclear.

## Code Changes
- Make minimal changes to accomplish the task.
- Don't refactor unrelated code unless asked.
- Don't add "nice to have" features.
- Preserve existing patterns (repository seam, store-only data access, theme tokens, `useStrings`).

## Code Review
Review AI-generated code periodically, especially for:
- **Correctness** — edge cases, day-rollover math (`dayStartHour`), effective-dated limits.
- **Performance** — unnecessary re-renders, heavy work on the JS thread, large lists without virtualization.
- **Patterns** — does it go through the store + repository? Theme tokens not hardcoded colors? Strings via `useStrings`? RTL-safe?
- **Security** — auth checks and input validation on the Supabase path.
