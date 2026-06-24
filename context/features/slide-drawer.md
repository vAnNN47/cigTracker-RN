# Slide Drawer

**What / where:** RTL-aware slide-in drawer with expand-in-place. Reusable core in
`packages/slide-drawer/` (theme-agnostic, Reanimated); app wrapper
`src/components/SlideDrawer.tsx` injects theme colors. Consumers:
`src/components/drawers/MainDrawer.tsx` (burger, 76% → 100%) and
`src/components/drawers/AccountDrawer.tsx` (avatar, full-screen with nested panels).

## Done

- [x] Opens from its own physical edge — RTL → right, LTR → left — for both the partial and full states — 2026-06-25
- [x] Expand-in-place: a list tap grows the 76% MainDrawer to a full screen (with a back button) and back collapses it — 2026-06-25
- [x] Extracted to `packages/slide-drawer/` (app-agnostic, color props, Reanimated UI-thread width) with README — 2026-06-25

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-25 — Built `packages/slide-drawer` (RTL-aware, Reanimated width on UI thread, `expanded`/`expandedContent` cross-fade, hardware-back). Replaced `src/components/SlideDrawer.tsx` with a thin theme-injecting wrapper (AccountDrawer unchanged). Rewired MainDrawer: a quick-link now expands the existing 76% drawer to 100% in place instead of close+reopen; back collapses to 76%, scrim closes. tsc clean; remaining lint = 2 `react-hooks/set-state-in-effect` (tracked triage category).
