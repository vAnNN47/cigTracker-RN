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
- [x] Expanding to full screen no longer re-flows text — each layer is pre-laid-out at its final width and uncovered by a clip — 2026-06-25
- [x] Drag the panel toward its own edge to dismiss (finger-tracking, threshold + fling) — 2026-06-25

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-25 — Built `packages/slide-drawer` (RTL-aware, Reanimated width on UI thread, `expanded`/`expandedContent` cross-fade, hardware-back). Replaced `src/components/SlideDrawer.tsx` with a thin theme-injecting wrapper (AccountDrawer unchanged). Rewired MainDrawer: a quick-link now expands the existing 76% drawer to 100% in place instead of close+reopen; back collapses to 76%, scrim closes. tsc clean; remaining lint = 2 `react-hooks/set-state-in-effect` (tracked triage category).
- 2026-06-25 — Fixed real-time text re-flow during the 76%→100% stretch: each cross-fade layer is now laid out at its FINAL width (collapsed `widthPct`, expanded full screen) and anchored to the panel's fixed physical edge inside an `overflow:"hidden"` clip, so the growing panel uncovers a pre-computed layout instead of re-wrapping the text every frame. (Shadow kept on the outer panel; clip moved to an inner view so iOS doesn't clip it.)
- 2026-06-25 — Added drag-to-close: a `Gesture.Pan` (activates only past 15px horizontal, so inner vertical scrolls still win) lets a drag toward the panel's own physical edge track the finger via a `drag` shared value added into the panel's `translateX`; on release it dismisses (`onClose`) when dragged past 33% of the collapsed width or flung >600px/s, else springs back. Each `SlideDrawer` carries its own gesture, so the MainDrawer (start edge), AccountDrawer (end edge) and the nested account sub-panel each close with the natural toward-edge swipe. Peer dep note + README updated. tsc + lint clean.
