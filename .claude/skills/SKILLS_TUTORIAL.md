# Skills — the simple guide

A friendly walk-through of the skills in this project. Type them as slash commands in
Claude Code (e.g. `/fire today`). For the exact arguments of each, see
[SKILLS_README.md](SKILLS_README.md) — this page is just the "what & when".

> **Reload the VS Code window** after adding or editing a skill.

---

## The big picture (1 minute)

There is **one** place work is tracked:

- **`context/roadmap.md`** — a single flat list of *everything* open, each line tagged `[area]`.

Per-area docs (`context/features/<area>.md`) hold **context + a dated fix log** — the story of
an area, not its open todos. The three flow-skills move work through the queue:

```
   ideas  ──►  /inbox  ──►  roadmap (the open queue)  ──►  /fire <area>  ──►  built + logged
                                      ▲                                            │
                              (a finished item moves to that area's Fix log)  ◄─────┘

                  before you device-test / release:  /polish   (clean + pay down debt)
```

**Golden rule:** one area = one *thing you'd open a branch for* (a tab, a sheet, a drawer) —
**not** one per button. A button tweak is a roadmap line, not its own doc.

---

## The skills, one by one

### `/inbox` — empty your brain-dump
You wrote a messy list of ideas on your phone (Hebrew is fine). Paste it here. It sorts each
line into the roadmap (tagged by area) and skips anything already on the list. It only *sorts* —
it never writes code.
> *"`/inbox` 1. no spinner on Today edit 2. more padding on sheet buttons…"* → it files item 1
> under `[today]`, item 2 under `[sheets]`, and tells you if either is already open.
**Reach for it when:** you're back at the PC with a batch of raw notes.

### `/fire <area>` — build one part of the app, all the way
The everyday command. Point it at an area and it goes end-to-end: cuts a branch, **builds**
every open `[area]` item from the roadmap, checks it compiles + lints **once** at the end, then
logs each fix (with today's date) into that area's doc and clears it from the roadmap.
- `/fire today` — branch + build all open Today items + verify + log.
- `/fire today merge` — when it's done + device-tested, merge into the parent branch.
> No "shall I start?" — `/fire` starts *and* finishes. You still device-test in Hebrew + English.
**Reach for it when:** you're ready to actually build/fix an area.

### `/polish` — tidy up before you ship
The pre-release pass. Fixes small mess (stray `console.log`, unused imports, dead files, leftover
Flutter mentions) **and** drains the roadmap's structural tech-debt (folder reorgs, merging files,
extracting a package) — one focused change at a time.
- `/polish` — report only, change nothing.
- `/polish run` — fix the trivial stuff you pick, then work the structural backlog.
**Reach for it when:** you've finished developing and are about to test on a device / cut a version.

### `/package` — reuse before you build
`packages/` holds portable, app-agnostic widgets (no cigarette logic). Always check here before
building reusable UI, and put new reusable things here.
- `/package list` · `/package check bottom sheet` · `/package new slide-drawer`
**Reach for it when:** you're about to build a generic, reusable component.

### `/skills-help` — remind me what my own commands do
A read-only guide to these skills, read live from each `SKILL.md` so it's always current.
- `/skills-help` (all of them) or `/skills-help fire` (one in depth).
**Reach for it when:** you forget which skill does what, or how to run one.

---

## A normal day

1. Back at the PC → `/inbox` your phone notes.
2. Pick an area → `/fire <area>` (it branches, builds, verifies, and logs the fixes).
3. Open the iPhone/Android and test it — in **both** Hebrew (RTL) and English (LTR).
4. Happy? → `/fire <area> merge`.
5. Before a release / when things feel messy → `/polish`.
