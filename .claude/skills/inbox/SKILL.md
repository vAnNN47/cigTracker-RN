---
name: inbox
description: Empty a brain-dump of ideas into the single roadmap queue — route + dedupe, no code
argument-hint: <paste your batch> (or run empty to read context/inbox.md)
---

# /inbox — sort a brain-dump into the queue

You jot ideas off-PC (often Hebrew, often numbered). This skill splits that batch and **routes
each item into the right queue**, tagged by area, deduped. It writes **no app code**, scaffolds
**no package**, cuts **no branch** — it just maps + asks, then **always commits** the doc edit on
the current branch (no asking). To build an area's items, run `/fire <area> <branch>`.

## ⚠️ Ask before you map (the most important rule)
A note reflects **how the user thinks**, not the first code match. One phrase can map to **several**
elements (e.g. "Save/Cancel buttons" exist on the edit sheet, the add sheets, *and* the number-pad).
For ANY item whose meaning, target element, or area isn't 100% clear, **ASK what they meant — and
which element — before routing.** Even in a 50-item list, clarify the ambiguous ones first; only
print the routing map once you're sure.

> When you answer a batch, use the **per-question ✅/❌/⚠️ breakdown** the user prefers
> (coding-standards / memory) — split the questions out, don't answer schematically.

## Input — $ARGUMENTS
Text in `$ARGUMENTS` **is** the batch (any language, numbered or not). Empty → read `context/inbox.md`.

## Where items go (two queues)
- **App** bugs/features/refactors → `context/roadmap.md` (the single app queue), tagged `[area]`.
- **Skills / workflow** tweaks (the `.claude/skills/*` system, the `context/` flow) →
  `.claude/skills/SKILLS_TODO.md` — kept separate so process notes don't pollute the app roadmap.
- `context/features/<area>.md` holds **context + gotchas only** (how an area is wired, lessons
  learned) — never open items, never a done-list. An item is open in exactly **one** queue, then
  **moves to the monthly archive** (`context/archive/YYYY/MM-month.md`) when it ships.

## Steps
1. **Split** the batch (by number/newline). Keep original wording; add a short English gloss in `()`.
2. **Classify → queue + section:**
   - App bug → roadmap 🐞 Bugs · App improvement/feature → roadmap 🧩 Improvements ·
     Structural/refactor/"consolidate" → roadmap 🧹 Reorg / tech debt.
   - Skills/workflow item → `SKILLS_TODO.md` (Open).
   - Reusable/portable widget → note as a `/package` candidate (don't scaffold).
3. **Detect the area tag** (kebab slug == roadmap `[tag]` == `features/<slug>.md` handle):
   | Slug | Cues |
   |------|------|
   | `today` | טודי, בית, home, count, ring/טבעת |
   | `diary` | יומן, calendar, log history |
   | `settings` | הגדרות, currency, price, baseline |
   | `sheets` | בוטום שיט, שיט, bottom sheet, save/cancel buttons |
   | `slide-drawer` | דראור, מגירה, drawer |
   | `stats` | סטטיסטיקה, progress, chart, savings |
   | `inputs` | טקסט, הקלדה, cursor, TextInput |
   | `community` | קהילה, social |

   No match → propose a new slug and ask before using it.

   > **Roadmap vs. SKILLS_TODO slugs differ.** Roadmap `[area]` tags **repeat** (many items share
   > `[today]`). **`SKILLS_TODO` slugs must be UNIQUE per item** — never add a second `[marketplace]`
   > or `[new-skill]`. Give each skills-item its own descriptive slug (`[caveman]`, `[render-audit]`);
   > if nothing fits use `[cool-task]`, and if that's taken, number it `[cool-task-01]`, `[cool-task-02]`.
4. **Dedupe** against both queues; an already-open item is marked ⚠️ **dup** and not re-added.
5. **Clarify ambiguities — ASK FIRST**, before printing anything (prefer `AskUserQuestion` to triage
   a long list crisply). Wait for answers. If everything is unambiguous, say so and proceed.
6. **Show the routing table** and stop for approval:

   | # | Item (orig + gloss) | → queue · tag | Section | Dup? |
   |---|---------------------|---------------|---------|------|

7. **On confirm** (`all` / `1,3` / edits like `2→sheets`):
   - add each item as a `- [ ]` line under its section, tagged `**[area]**`, **leading with a plain
     one-liner** — see the rule below — then the technical detail;
   - package candidates → note "run `/package new <name>`".
8. If the batch came from `context/inbox.md`, **remove the triaged lines** from it.
9. **Commit** the roadmap / `SKILLS_TODO` (+ `inbox.md`) edit on the current branch with
   a `docs:` message — never ask, just do it. Local only: never push, never `main`.

## Rules
- **Every item leads with a plain one-liner.** Format: `- [ ] **[area]** **<bold, jargon-free
  sentence a non-technical person understands>** — <technical detail>`. The bold part answers
  "what is this, in human words?" (no `accessibilityLabel`, no `Clipboard.setStringAsync`, no file
  names) — the geek detail goes *after* the em-dash. Applies to **both** queues (roadmap +
  `SKILLS_TODO`). Never write an item that's only code-speak.
- **ASK before mapping** — the first code match is not automatically the right one.
- **No app code, no scaffolding, no branch** — inbox only routes + auto-commits the doc edit.
- One item lands in exactly one place; keep the kebab **slug == `[tag]`** convention.
- **`SKILLS_TODO` tags are unique per item** (roadmap `[area]` tags repeat; skills slugs don't). No
  duplicate `[marketplace]`/`[new-skill]` — fall back to `[cool-task]` → `[cool-task-01]` if stuck.
