# Archive — June 2026

<!-- Shipped this month, newest day on top. Format + rules → context/archive/README.md -->

## 2026-06-28
- [app][a11y] Accessibility pass (3 of 4 parts shipped). (1) **Screen-reader labels** — added `accessibilityRole="button"` + `accessibilityLabel` (strings via `useStrings`, new `a11y*` keys in `strings.ts`) to every icon-only `Pressable`: TabHeader burger/avatar, calendar month prev/next arrows + each day cell (date + count + within/over-limit), settings back + stepper −/+ + value, purchases back, MainDrawer back, AccountDrawer back ×2, progress range chips. Text-labelled Pressables (drawer Rows, currency/lang/theme rows) already read their child `Text`; tab-bar buttons inherit a11y from React Navigation via the spread `tabBarButton` props — left as-is. (2) **Color-alone status** — calendar over-days now `underline` the count (not red fill alone, WCAG 1.4.1); the per-cell SR label states the status in words too. (3) **Touch targets** — progress range chips were `py-2` (~32pt) → added vertical `hitSlop`; the 32×32 calendar month arrows already had `hitSlop={8}` (→48pt). (4) **Contrast** = audit-only finding: light `textDim` `#6C7B6D` ~4.1:1/4.3:1 fails AA 4.5 for small text → filed as the residual open `[a11y]` line; dark theme passes. Dynamic Type = device test (user). `tsc`+lint clean.
- [app][edit-log] Recent-log row note/time alignment — the note didn't sit on the time's baseline (Today's recent-log row, `(tabs)/index.tsx`). Cause: time `15px` mono + note `13px` under `items-center` centers the two boxes, so the smaller note floated off the larger time's baseline. Fix: wrap time+note in a `flex-1 flex-row items-baseline` group (dot stays centered in the outer row). The other time+note surfaces were already fine — calendar diary row joins both into ONE `Text`, LogDetailSheet stacks them. ("edit screen" in the roadmap line was imprecise; the only two-element time/note layout is the Today recent row.)
- [app][inputs] Clipboard "Cannot find native module 'ExpoClipboard'" watch item closed — not a code bug. Only `expo-clipboard` use is `LogDetailSheet` "Copy text" → `src/lib/clipboard.ts`, which already lazy-`import`s + `try/catch` so a dev client missing the native module no-ops instead of crashing. The dev error = stale dev client (native dep added but client not recompiled); release builds compile it in → works (user-confirmed). Fix for dev = rebuild the dev client (`eas build --profile development` for iOS on Windows / `npm run android` for Android). No code change. (expo/expo #24917, #24883)
- [app][edit-log] Android diary-scroll fix — linchpin: **`mode="layout"`** on `KeyboardAwareScrollView`. keyboard-controller 1.21.x's default `mode="insets"` has a broken Android contentInset/clipping path (lib #1394) that never extends the scroll range when the keyboard opens → content trapped behind it; `mode="layout"` uses a real spacer view. Plus `flex:1` (bounded scroll), `presentation:"card"` not `"modal"` (modal = separate Android window the root KeyboardProvider misses), and `scrollEnabled={false}` on the multiline diary. Caveat: dragging on the diary textarea still won't scroll (Android multiline grabs the drag — inherent). flex:1 alone was NOT enough. Proven on-device (user real-time on S9 + adb). (rn-debug; iOS lenient)
- [app][edit-log] Edit-screen iOS clock RTL fix — same as the AddSmokeSheet fix: dropped the `w-[112px] items-end` wrapper around the `@expo/ui` compact `DateTimePicker` and snugged its style to `84×44`, so the leading-aligned time pill no longer leaves trailing dead-space ("pushed too far right") in RTL; 44pt min touch target.

## 2026-06-27
- [app][sheets] AddSmokeSheet time picker RTL fix — iOS compact picker frame snugged (112→84px) so the leading-aligned pill no longer leaves trailing dead-space (the red artifact) in RTL; picker bumped to 44pt min touch target.
- [app][styling] NativeWind v5 / Tailwind v4 migration COMPLETE — all 20 screens `StyleSheet` → `className`, `makeUseStyles` retired, `--spacing` pinned 4px, styling rule flipped to NativeWind in the standards docs.
- [app][sheets] Log copy → clipboard + toast (was OS share sheet); copies comment + diary only.
- [app][theme] Discord-style dark redesign + semantic color tokens (error/status/histSoft/feelChip/shadow) across the app.
- [app][perf] Render-storm killed (screens subscribe via `useShallow` selectors); Stats series memoized; `purchases` SectionList-virtualized; `calendar` O(1) day-count map.
- [app][inputs] iOS caret-jump fixed — free-text fields made uncontrolled (`defaultValue` + ref).
- [skills][advisor] Authored `/advisor` — area counselor with a two-voice (Advisor + קונטרה) drift check; registered in SKILLS_README.
- [skills][done-store-split] Made `SKILLS_TODO.md` open-only; drained its inline `## Done` to a separate done-store.
- [skills][one-line-restate] Baked restate-before-build into `/fire` + `/skill-forge`.
- [skills][done-handling] Unified done-item handling into one documented model.

## 2026-06-26
- [skills][archive-tracking] Built the ledger-archive mechanism (move-never-delete; size-gated roll).
- [skills][render-audit][app-ui-design] Adopted marketplace `expo-react-native-performance` + `app-ui-design`; layered under the flow.
- [skills][caveman] Adopted marketplace `caveman` output-prose compressor.
- [skills][wtf] Authored `/wtf` catch-up button; folded in `/recall` + `/skills-help`.
- [skills][skill-forge] Authored `/skill-forge` — the SKILLS_TODO drainer (the `/fire` twin).
- [skills][skill-creator] Adopted marketplace `skill-creator`; added a /10 score to `/skill-doctor`; ditched `/list-components`.
- [skills][unique-slugs] Made every open SKILLS_TODO item carry a unique `[slug]`.
- [skills][polish-check] `/polish check` forced to LSP-for-symbols + documented `check [file]` scope + queue routing.

## 2026-06-25
- [skills][tracking] Task-tracking loop v1 (ledger + digest skill).
- [skills][refactor] Slimmed the SKILL.md files — house-rules collapsed into one SKILLS_README section.
- [skills][lsp] Code-touching skills prefer the LSP tool; STOP (no grep fallback) if LSP is down.
- [skills][no-any] "Never `any`" baked into the skills + coding-standards.
- [skills][autocommit] Every skill auto-commits on its own fresh branch (no push/main); report-only runs don't.
- [skills][inbox-ask] `/inbox` must ask before mapping ambiguous items.
