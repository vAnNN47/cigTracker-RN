---
name: logbug
description: >
  Log a solved HARDCORE bug (tooling / environment / build / plugin / editor — NOT an app bug)
  as a portable postmortem in context/bug-journal.md. Drafts the entry from the bug just solved,
  asks to confirm, appends newest-on-top, and auto-commits the doc on the current branch.
  Triggers on /logbug.
---

# /logbug — record a solved hardcore bug

For the nasty, non-obvious bugs worth never re-debugging from scratch. Writes a structured
postmortem to [context/bug-journal.md](../../../context/bug-journal.md) so future-you (even on a
new machine) has the recipe.

## Scope — what belongs here
- ✅ Tooling / environment / build / plugin / editor / CI / shell bugs — things outside the app.
- ❌ **App** bugs (UI, store, repo, domain) → those go to `roadmap.md` via `/inbox`, then a
  feature Fix log. Don't double-log.

## Steps
1. **Draft from the bug just solved** in this conversation (or from the `$ARGUMENTS` description).
   Fill the template in `bug-journal.md`:
   `Symptom · Environment · Wrong turns · Root cause (+repo issue/PR links) · Fix (file paths) ·
   Verify · Prevention · Caveat`.
   - **Wrong turns matters** — record the dead ends so they aren't repeated.
   - Always hunt for and link the upstream issue/PR (check OPEN **and** CLOSED) — per the
     "never guess, check the repo first" standard.
2. **Show the drafted entry and ask** to confirm / edit before writing. Don't guess the title.
3. On confirm: **append newest-on-top** under the journal header (below the template block).
4. **Auto-commit** `context/bug-journal.md` on the **current branch** with a `docs(bug-journal):`
   message — no new branch, no asking. Local only: never push, never `main`/`master`
   (doc-only, same rule as `/inbox`).
5. **If the bug matters beyond this repo** (a plugin/tool others use), offer to post the recipe to
   the **upstream tracker** (`gh issue comment`) so it's googleable from any environment — ask first.
6. Optional: add a one-line memory pointer so the journal surfaces in future sessions.

## Rules
- No app code, no branch — `/logbug` only writes + commits the journal doc (like `/inbox`).
- One entry per bug; keep the template fields; link the real upstream issue/PR.
- Outward-facing posts (upstream comments) need an explicit go-ahead each time.
