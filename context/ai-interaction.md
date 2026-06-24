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
2. **Branch** — `/feature <name> start` cuts a branch off the current branch (see Branching).
3. **Implement** — build the goals one by one.
4. **Verify** — there is no web `build` step. Verify by:
   - `npx tsc --noEmit` passes (no type errors), and
   - `npm run lint` is clean, and
   - it works on a device/emulator (run via `npx expo start`), checked in **both Hebrew (RTL) and English (LTR)**.
5. **Iterate** — adjust as needed.
6. **Commit** — only after verify passes (see Commits — ask first).
7. **Merge** — merge into the **parent** branch it was cut from. **Never** `main`/`master` automatically (see Branching).
8. **Delete branch** — after merge (ask first).
9. **Review** — review AI-generated code periodically and on demand.
10. Mark complete in [current-feature.md](current-feature.md) and append to History.

Do NOT commit until typecheck passes. If types fail, fix them first.

## Branching
- New branch per feature/fix, **cut from the branch you're on**. Name `<current-branch>_<name>_<NN>` (NN starts `01`) — e.g. on `dev_02`, feature `clock` → `dev_02_clock_01`. Create it with `/feature <name> start`.
- Merge a finished feature into its **parent** branch; ask before deleting the branch once merged.
- **🔒 `main`/`master` is protected** — never merge or push there automatically. A main merge needs BOTH, in order: (1) you confirm you tested on a real device (iOS or Android), then (2) an explicit second go-ahead.

## Commits
- **Ask before committing** (don't auto-commit).
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
