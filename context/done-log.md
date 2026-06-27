# Done-log — the ledger (what was asked, what shipped)

Append-only, **reverse-chronological** record that closes the tracking loop: after a batch
of work it's easy to forget *what you asked for* and *what actually got done*. This file is
the one place both live, stamped with a date.

- **`/inbox`** appends an **ASKED** block — the raw batch + where each item was routed.
- **`/fire`** appends a **SHIPPED** block — each item it closed, with the branch.
- **`/wtf`** reads this (plus `roadmap.md` / `SKILLS_TODO.md`) to print the catch-up / open-vs-done digest.

Open work still lives in `context/roadmap.md` + `.claude/skills/SKILLS_TODO.md`; per-area detail
stays in each `context/features/<area>.md` **Fix log**. This ledger is the chronological index
over all of it — never delete entries, only add.

**ASKED — 2026-06-27 — done-handling + one-line-restate + log-copy-to-clipboard**
- Item 1+2 (where does a done roadmap item go; SKILLS_TODO done-items should behave like the roadmap) → `SKILLS_TODO.md` Open · `[done-handling]`.
- Item 4 (before building any roadmap/SKILLS_TODO item, restate in one sentence what it requires) → `SKILLS_TODO.md` Open · `[one-line-restate]`.
- Item 3 (log copy: replace OS share with clipboard + native snackbar; copy comment + diary only) → `roadmap.md` 🧩 Improvements · `[sheets]`.

**Archiving (keeps this file scannable):** when this file passes **~150 lines**, `/polish run`
offers to **move** (never delete) the oldest batches into `context/archive/done-log-<year>.md`,
leaving the newest ~15 batches here plus a pointer. `/wtf since <old-date>` reads the archive too,
so nothing vanishes. See [archive/README.md](archive/README.md).

> Format: newest at the top. `ASKED` = an intake batch. `SHIPPED` = completed work.

---

**SHIPPED — 2026-06-27 — log copy → clipboard + toast (branch: `perf-render-audit_theme_01_sheets_01`)**
- `[sheets]` (🧩 Improvements) — `LogDetailSheet` **Copy text** now copies straight to the clipboard with a "Copied to clipboard" toast instead of opening the OS share sheet. `copyAll`: `Share.share` → `expo-clipboard` `setStringAsync` + `useToast()`; copied text = **comment + diary only** (dropped the `cigNumber · time` header). New `copiedToast` string (he/en); added `expo-clipboard ~56.0.4`. Side-fix: restored `eslint`/`eslint-config-expo` as devDeps (extraneous → pruned by the install; lint gate needs them). tsc + lint clean.

---

**SHIPPED — 2026-06-27 — Discord dark redesign + semantic color tokens (branch: `perf-render-audit_theme_01`)**
- `[theme]` (🧩 Improvements) — Discord-style dark mode: retuned the `dark` palette to neutral-gray surfaces + forest-green accent; flips the whole app through `useColors()`. Light palette untouched. User picked "Discord gray + forest green" from previews.
- `[theme]` (🧹 Tech debt) — semantic tokens `error` / status (`underBg/underBorder/overBg/overBorder/overText`) / `histSoft` / `feelChipSel` / `shadow` added to both palettes; replaced hardcoded literals across calendar, progress, settings, AddPurchaseSheet, AddSmokeSheet, Login/Welcome, index, Toast. Savings-card `#FFFFFF` + `AVATAR_TINTS` left intentionally (see `features/theme.md` Fix log). tsc + lint clean.

## 2026-06-27 — SHIPPED (branch: `perf-render-audit`)
User correction (doc-only, skills-system):
- **[done-store-split]** Made `SKILLS_TODO.md` **open-only like `roadmap.md`** — drained its growing inline `## Done` pile into a new done-store **`context/archive/skills-done.md`** (the skills "Fix log"). Reverses the `[done-handling]` inline-`## Done` decision (user's call). Rewired `/skill-forge` step 6 (archive the line, never keep a `## Done` section), the `SKILLS_README` Done-handling table, the `archive/README.md`, and added a sibling-queue + done-store pointer to `roadmap.md`'s header (it claimed to be "the single open queue" but `SKILLS_TODO` is a second one).

---

## 2026-06-27 — SHIPPED (branch: `perf-render-audit`)
Built via `/skill-forge one-line-restate` (doc-only, skills-system):
- **[one-line-restate]** — Baked **restate-before-build** into both drainers: `/fire` step 3 + `/skill-forge` step 4 now lead with "restate each item in one sentence ('this item asks me to ___')" before any edit, pinning scope before code/docs. SKILLS_TODO Open → empty.

---

## 2026-06-27 — SHIPPED (branch: `perf-render-audit`)
Built via `/skill-forge done-handling` (doc-only, skills-system):
- **[done-handling]** Unified done-item handling into one documented model. `/skill-forge` now
  appends a `SHIPPED` block to **this ledger** like `/fire` does (it previously only moved the line
  to `SKILLS_TODO ## Done`, leaving skills-work out of the chronological index). Added a
  **Done-handling** section to `SKILLS_README` (open store → done store per kind + the shared
  ledger; the per-area-file vs. inline-`## Done` asymmetry is by design). Answers item-1: a done
  roadmap item lands in its `features/<area>.md` Fix log **+** a `done-log.md` SHIPPED block,
  leaving `roadmap.md`. *(This very block is the rule dogfooded.)*

---

## 2026-06-27 — SHIPPED (branch: `perf-virtualization`)
Built via `/fire perf` — drains the last `[perf]` audit items:
- **[perf]** Virtualized `purchases.tsx` history: `ScrollView`+nested `.map` → built-in
  `SectionList` (no new dep; FlashList not in project). Rows now recycle.
- **[perf]** `calendar.tsx` grid: replaced per-cell `countForDay` (filter+sort over all logs, 42×3
  cells) with one memoized `Map<dayKey,count>` looked up O(1). Selection JSX untouched.
- `[perf]` audit now fully drained; `app-ui-design` findings remain as `[a11y]` + `[theme]`.

---

## 2026-06-27 — SHIPPED (branch: `perf-render-audit`)
Built via `/fire perf` (partial — render-storm + memoization done; item stays open for the rest):
- **[perf]** Killed the whole-app render-storm: 5 screens (`index`, `calendar`, `progress`,
  `purchases`, `settings`) subscribed to the **entire** store (`useAppStore()` no selector), so any
  `set()` re-rendered every mounted tab. Switched all to `useShallow` slice selectors. Same root as
  the `[inputs]` caret bug.
- **[perf]** Memoized `progress.tsx`'s O(logs) Stats series (`dailyStats`/`savingsSeries`/
  `hourlyHistogram`) with `useMemo`.
- **Left open** (narrowed roadmap `[perf]`): `app-ui-design` cross-check, `purchases` list
  virtualization, `calendar` per-cell month scan. See `context/features/perf.md`.

---

## 2026-06-27 — SHIPPED (branch: `input-fast-type-fix`)
Built via `/fire inputs`. Closed:
- **[inputs]** iOS cursor-jumps-backwards-on-fast-typing bug. Made all four free-text fields
  (edit-log comment/diary, AddSmokeSheet feeling/notes) **uncontrolled** (`defaultValue` + ref
  capture) — kills the per-keystroke re-render that fed a stale `value` back and bounced the caret.
  Audit note: settings price/baseline + add-purchase use NumberPad, not `TextInput`, so the
  roadmap's mention of them didn't apply. See `context/features/inputs.md`.

---

## 2026-06-26 — ASKED (batch: "/bobcat or delete done-logs entirely? commit enough?")
Routed via `/inbox` → **no new item** — folded as pinned decisions into existing SKILLS_TODO `[archive-tracking]`.
Best-practice answer: keep the ledger (commit = shipped-only, captures no ASKED side), no cloud-push, archive-move not delete; strip trigger = status (open queues self-prune) + size roll (done-log > ~150 lines → `archive/<cat>/<year>/`); maintenance pass not per-session; context-cost ~0 (done-log is on-demand, not auto-loaded).
- → SKILLS_TODO `[archive-tracking]` (folded: rejected `/bobcat`/delete; pinned two-tier strip trigger + who-pulls-it + context note)

## 2026-06-26 — ASKED (batch: "per-batch archive for done-vs-todo tracking")
Routed via `/inbox` → one SKILLS_TODO design item. Marketplace checked (`npx skills find`):
no skill clears the trust bar — only git `changelog-generator`s (≤115 installs), which diff
git history rather than track todo/done by category+date. Build in-house.
- → SKILLS_TODO `[archive-tracking]` — design `archive/<category>/<date>/<batch>` per-batch archive; reconcile with (not duplicate) the existing done-log + Fix-log + `/wtf` loop. Deferred design → likely `/skill-forge`.

## 2026-06-26 — ASKED (batch: "wtf on new skills + cross perf skill against our code")
Routed via `/inbox` → one SKILLS_TODO doc task, one new roadmap **🔍 Audits** section + item.
Also restructured roadmap sections: added **🔍 Audits** (skill-driven sweeps), renamed
**🧹 Reorg / tech debt** → **🧹 Tech debt**.
- → SKILLS_TODO `[skills-explainer]` — persistent cheat-sheet for the new skills (perf / ui-design / caveman / wtf / skill-forge / skill-doctor)
- → roadmap `[perf]` (🔍 Audits) — whole-app render audit: run `expo-react-native-performance` + `app-ui-design` across `src/` + `packages/` to catch render/best-practice issues

## 2026-06-26 — SHIPPED (branch `skill_testing_02_skills-refactor`)
- ✅ `[refactor]` — slimmed the messy SKILL.md files. The repeated house-rules (LSP-over-grep,
  never-`any`, verify=tsc+lint, branch/commit) now live once in **SKILLS_README → House rules**;
  each skill points there instead of restating. Tightened `fire`/`polish`/`inbox`, standardized
  `list-components`, and synced `inbox` to reality (skills-items → `SKILLS_TODO`, app-items →
  roadmap; logs the `ASKED` ledger block). Net: noticeably shorter, single source for the rules.

## 2026-06-25 — SHIPPED (branch `skill_testing_01_tracking-loop`)
- ✅ `[tracking]` — task-tracking loop **v1**: this `context/done-log.md` ledger + new `/recall`
  skill (open-vs-done digest) + `/inbox` & `/fire` wired to append `ASKED`/`SHIPPED` blocks.
  Registered `/recall` in `SKILLS_README.md`; `[tracking]` marked `[~]` in `SKILLS_TODO.md`
  (v2 idea: per-item IDs). Commit `e24dada`.

## 2026-06-25 — ASKED (batch: "skills next level")
Routed via `/inbox` → mostly `.claude/skills/SKILLS_TODO.md` (skills-system), one app bug → `roadmap.md`.
- → SKILLS_TODO `[marketplace]` — adopt skills.sh / skill-creator
- → SKILLS_TODO `[strategy]` — keep ours + marketplace skills both
- → SKILLS_TODO `[refactor]` — slim the SKILL.md files (progressive disclosure)
- → SKILLS_TODO `[new-skill]` — render-audit / performance skill
- → SKILLS_TODO `[tracking]` — close the task-tracking loop ← **building now**
- → SKILLS_TODO `[scope]` — which skills this app needs
- → SKILLS_TODO `[portability]` — generic skills to user-level `~/.claude/skills/`
- → SKILLS_TODO `[new-skill]` — skill-creator to author new ones
- → SKILLS_TODO `[answer-format]` — per-question ✅/❌/⚠️ breakdown
- → roadmap `[inputs]` — iOS cursor jumps backwards when typing fast (audit all controlled TextInputs)
