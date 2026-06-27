# Slide Drawer

**What / where:** RTL-aware slide-in drawer with expand-in-place. Reusable core in `packages/slide-drawer/` (theme-agnostic, Reanimated); app wrapper [src/components/drawers/SlideDrawer.tsx](../../src/components/drawers/SlideDrawer.tsx) injects theme colors. Consumers: [MainDrawer](../../src/components/drawers/MainDrawer.tsx) (burger, 76% → 100%) and [AccountDrawer](../../src/components/drawers/AccountDrawer.tsx) (avatar, full-screen with nested panels).

## How it's wired

- Core `packages/slide-drawer/` drives width on the **UI thread** (Reanimated), with `expanded`/`expandedContent` cross-fade + hardware-back. MainDrawer expands the existing 76% panel to 100% **in place** (back collapses to 76%, scrim closes) — not close+reopen.
- Each cross-fade layer is laid out at its **final** width and anchored to the panel's fixed physical edge inside an `overflow:hidden` clip, so expanding **uncovers** a pre-computed layout instead of re-wrapping text every frame. Shadow on the outer panel; clip on an inner view (so iOS doesn't clip the shadow).
- Drag-to-close: a `Gesture.Pan` activates only past 15px horizontal (so inner vertical scroll still wins), tracks the finger toward the panel's own edge, and dismisses past 33% width or fling >600px/s, else springs back. Each SlideDrawer carries its own gesture (MainDrawer start-edge, AccountDrawer end-edge, nested panel).

## Gotchas / lessons

- Opens from its own **physical** edge — RTL→right, LTR→left — for both partial and full states.
