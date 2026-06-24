---
name: feature
description: Open or update one app feature/component's own context doc (todos, problems, dated fix log)
argument-hint: <feature-name> [todo|fix <text>]
---

# /feature — per-feature context docs

Every app area (a screen, a tab, a sheet, a button, a component) gets ONE living
markdown doc at `context/features/<name>.md` that tracks its open todos/problems,
what's done, and a **dated log of past fixes**. This skill opens and updates those
docs. It does NOT touch git — you commit code yourself.

## Usage

| Command | What it does |
|---------|--------------|
| `/feature <name>` | Show that feature's doc. If it doesn't exist, create it from `context/features/_template.md` and fill in **What / where**. |
| `/feature <name> todo <text>` | Add an open todo/problem to the doc **and** mirror it into `context/roadmap.md`. |
| `/feature <name> fix <text>` | Log a completed fix: append `- YYYY-MM-DD — <text>` to the doc's **Fix log**, check off the matching todo, and remove it from `context/roadmap.md`. |

`<name>` is kebab-case: `settings`, `today`, `edit-log-sheet`, `slide-drawer`, …

## Steps

1. Resolve `context/features/<name>.md`. If missing, copy `_template.md`, set the
   title, and fill **What / where** (one-line purpose + main source files). Ask if
   you can't infer them.
2. If the command includes extra text, apply the verb:
   - `todo` → add a `- [ ]` line under **Open**, and add the same item to `context/roadmap.md`.
   - `fix` → move the item to **Fix log** with **today's date** (YYYY-MM-DD), tick it in **Done** if relevant, and delete it from `context/roadmap.md`.
3. Keep `context/roadmap.md` consistent (every open problem listed there; resolved ones removed).
4. Print the doc's **Open** list and the last few **Fix log** entries.

That's the whole skill — no branches, no merge, no reset.
