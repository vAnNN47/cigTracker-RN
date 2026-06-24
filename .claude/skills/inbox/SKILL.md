---
name: inbox
description: Empty a brain-dump of ideas into the single roadmap queue — route + dedupe, no code
argument-hint: <paste your batch> (or run empty to read context/inbox.md)
---

# /inbox — sort a brain-dump into the roadmap queue

You jot ideas off-PC (often Hebrew, often a numbered list). This skill reads that raw
batch and **routes each item into `context/roadmap.md`** — the single open queue —
tagged by area, and **dedupes** so nothing lands twice. It is **intake only**: it never
writes app code, never cuts a branch, never scaffolds a package. (To actually build an
area's items, run `/fire <area>`.)

## ⚠️ Ask before you map (the most important rule)

A head-junk note reflects **how the user thinks**, not the literal first match in the code.
The same phrase can correspond to **several** elements — e.g. "Save/Cancel buttons" exist on
the edit sheet, the add sheets, *and* the number-pad. **Never assume the first thing you see
is the single source of truth; elements can have similarities.** For ANY item whose meaning,
target element, or area is not 100% unambiguous, **ASK the user what they meant — and which
element they meant — before routing it.** Even if the batch is a 50-item list, clarify the
ambiguous ones first; only print the final routing map once you're sure. ASK, ASK, ASK.

> This is nothing personal — it's just the way the user thinks. Asking is how we stay aligned
> and avoid mapping the wrong thing into the roadmap.

## Input — $ARGUMENTS
- If `$ARGUMENTS` has text, that **is** the batch (Hebrew / English / mixed, numbered or not).
- If empty, read `context/inbox.md` (if it exists) and use its lines.

## The model (read this)
- **`context/roadmap.md` is the ONE place open work lives**, tagged `[area]`. Everything
  open across the app is here — bugs, improvements, and a **🧹 Reorg / tech debt** section.
- **`context/features/<area>.md` holds context + a dated Fix log only — NOT open items.**
  So inbox writes to the roadmap, *not* to feature docs. (An item is open in the roadmap,
  then `/fire` moves it to the area doc's Fix log when done — never in two places.)

## Steps

1. **Split** the batch into items (by number or newline). Keep each item's original wording
   (Hebrew stays Hebrew); add a short English gloss in parentheses.
2. **Classify each item** — type → roadmap section:
   - **App bug** → 🐞 Bugs, tagged `[area]`.
   - **App improvement / feature** → 🧩 Improvements, tagged `[area]`.
   - **Structural / refactor / reorg / "consolidate"** → 🧹 Reorg / tech debt.
   - **Reusable / "should always work this way" / portable widget** → note as a `/package` candidate.
3. **Detect the area tag** (kebab slug == the `[tag]` == a `features/<slug>.md` handle):
   | Area slug | Hebrew / English cues |
   |-----------|------------------------|
   | `today` | טודי, בית, home, count, ring/טבעת |
   | `diary` | יומן, calendar, log history |
   | `settings` | הגדרות, currency, price, baseline |
   | `sheets` | בוטום שיט, שיט, bottom sheet, save/cancel buttons |
   | `slide-drawer` | דראור, מגירה, drawer |
   | `stats` | סטטיסטיקה, progress, chart, savings |
   | `community` | קהילה, social |

   No match → propose a new slug and ask before using it.
4. **Dedupe** — check `context/roadmap.md` before adding. If an item is already open there,
   mark it ⚠️ **dup** and do NOT add it again.
5. **Clarify ambiguities — ASK FIRST (before printing anything).** For every item where the
   meaning, the **specific element/component**, or the area is not certain, ask the user what
   they meant — don't guess. Remember an item can map to **more than one** element, and the
   first code match is **not** automatically the right one. Prefer `AskUserQuestion` so a long
   list can be triaged crisply (which element? one thing or several? did I read the intent
   right?). Wait for the answers, then continue. If everything is genuinely unambiguous, say so
   and proceed.
6. **Show the routing table** and stop for approval:

   | # | Item (orig + gloss) | → tag | Section | Dup? |
   |---|---------------------|-------|---------|------|

7. **On confirm** (`all` / `1,3` / edits like `2→sheets`):
   - add each item as a `- [ ]` line under its roadmap section, tagged `**[area]**`
     (link to `features/<area>.md` if that doc already exists);
   - package candidates → note "run `/package new <name>`" — do NOT scaffold here.
8. If the batch came from `context/inbox.md`, **remove the triaged lines** from it.

## Rules
- **ASK before mapping** — clarify every ambiguous item (meaning + which element) with the user
  *before* writing anything to the roadmap. The first code match is NOT automatically the source
  of truth; similar elements exist. Never print the map until you're sure.
- **Routing only** — never write code, cut a branch, or scaffold a package.
- The roadmap is the **single source of truth**; always dedupe against it.
- One item lands in exactly one place — pick the best section, don't double-file.
- Keep the kebab **slug == roadmap `[tag]`** convention (see SKILLS_README).
