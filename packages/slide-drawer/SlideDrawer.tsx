/**
 * SlideDrawer — a lightweight slide-in drawer panel with a scrim backdrop and an
 * RTL-aware physical side (start = right in Hebrew, left in English).
 *
 * Three things make it more than a plain drawer:
 *  - EXPAND IN PLACE: it opens at `widthPct` (e.g. 0.76) and, when `expanded`
 *    flips true, the SAME panel grows to full screen and cross-fades from
 *    `children` to `expandedContent` — so a list tap feels like the drawer
 *    becoming a full screen (with your own back button) rather than a second
 *    panel sliding over the first. Collapsing reverses it back to `widthPct`.
 *  - NO REFLOW WHILE GROWING: each layer is laid out at its FINAL width from the
 *    first frame (collapsed = `widthPct`, expanded = full screen), anchored to the
 *    panel's fixed edge, and the growing panel simply uncovers it through a clip —
 *    so text never re-wraps mid-stretch.
 *  - SIDE STAYS PHYSICAL + DRAG TO CLOSE: it always opens from its own edge
 *    (RTL → right, LTR → left), grows from that same edge, and a horizontal drag
 *    toward that edge dismisses it (the panel tracks the finger, then slides off
 *    when released past a threshold or with a fling).
 *
 * App-agnostic: colors come in as props (`panelColor` / `scrimColor`); no theme
 * import. Width + drag animate on the UI thread via Reanimated.
 *
 * Peer deps: react-native-reanimated, react-native-worklets, react-native-gesture-handler.
 */
import { ReactNode, useEffect, useState } from "react";
import {
  BackHandler,
  I18nManager,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export interface SlideDrawerProps {
  open: boolean;
  /** Reading-relative edge. `start` = right in RTL / left in LTR; `end` is the opposite. */
  side?: "start" | "end";
  /** Override the RTL-derived physical side. */
  forceSide?: "left" | "right";
  /** Collapsed width as a fraction of the screen (0..1). 1 = full screen. Default 0.78. */
  widthPct?: number;
  /** When true the panel grows from `widthPct` to full screen and cross-fades to `expandedContent`. */
  expanded?: boolean;
  /** Screen cross-faded in while `expanded`. Render your own back control here that calls back to collapse. */
  expandedContent?: ReactNode;
  /** Scrim tap / hardware-back / drag-to-edge while collapsed. */
  onClose: () => void;
  /** Hardware-back while `expanded`. Falls back to `onClose` when omitted. */
  onCollapse?: () => void;
  /** Panel surface color. */
  panelColor?: string;
  /** Backdrop color (already includes its own alpha). */
  scrimColor?: string;
  children?: ReactNode;
}

const OPEN_MS = 260;
const CLOSE_MS = 220;
const GROW_MS = 280;
const SPRING_BACK_MS = 180;
// A drag past this fraction of the collapsed width (or a fling past this velocity) dismisses.
const CLOSE_DRAG_FRACTION = 0.33;
const FLING_VELOCITY = 600;
// Defer to inner vertical scrolls until the gesture is clearly horizontal.
const HORIZONTAL_ACTIVATION = 15;

export function SlideDrawer({
  open,
  side = "start",
  forceSide,
  widthPct = 0.78,
  expanded = false,
  expandedContent,
  onClose,
  onCollapse,
  panelColor = "#ffffff",
  scrimColor = "rgba(9,29,46,0.45)",
  children,
}: SlideDrawerProps) {
  const { width: screenW } = useWindowDimensions();
  const collapsedW = Math.round(screenW * widthPct);
  const fullW = screenW;

  const physicalSide: "left" | "right" =
    forceSide ?? (side === "start" ? (I18nManager.isRTL ? "right" : "left") : I18nManager.isRTL ? "left" : "right");
  // RN auto-swaps the `left`/`right` style props in RTL, so to actually pin the
  // panel to `physicalSide` we choose the key that lands there AFTER the swap.
  // (translateX is NOT swapped, so the hidden offset stays physical.) The inner
  // layers reuse `pinLeft` so they anchor to the SAME physical edge the panel
  // grows from — that's what lets the growing panel uncover a fixed layout.
  const pinLeft = (physicalSide === "left") !== I18nManager.isRTL;
  const hiddenSign = physicalSide === "left" ? -1 : 1;

  const appear = useSharedValue(open ? 1 : 0); // 0 = off-screen, 1 = resting
  const grow = useSharedValue(expanded ? 1 : 0); // 0 = collapsed, 1 = full screen
  const drag = useSharedValue(0); // live finger offset toward the closing edge
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      drag.value = 0;
      setMounted(true);
      appear.value = withTiming(1, { duration: OPEN_MS });
    } else if (mounted) {
      appear.value = withTiming(0, { duration: CLOSE_MS }, (finished) => {
        "worklet";
        if (finished) scheduleOnRN(setMounted, false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    grow.value = withTiming(expanded ? 1 : 0, { duration: GROW_MS });
  }, [expanded, grow]);

  useEffect(() => {
    if (!mounted) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (expanded) (onCollapse ?? onClose)();
      else onClose();
      return true;
    });
    return () => sub.remove();
  }, [mounted, expanded, onClose, onCollapse]);

  // Drag the panel toward its own edge to dismiss; the panel tracks the finger
  // (closing direction only), then on release either flies off (past the
  // threshold / a fling) or springs back.
  const dismiss = Gesture.Pan()
    .activeOffsetX([-HORIZONTAL_ACTIVATION, HORIZONTAL_ACTIVATION])
    .onUpdate((e) => {
      "worklet";
      drag.value =
        hiddenSign > 0 ? Math.max(0, Math.min(e.translationX, fullW)) : Math.min(0, Math.max(e.translationX, -fullW));
    })
    .onEnd((e) => {
      "worklet";
      const moved = hiddenSign > 0 ? e.translationX : -e.translationX;
      const vel = hiddenSign > 0 ? e.velocityX : -e.velocityX;
      if (moved > collapsedW * CLOSE_DRAG_FRACTION || vel > FLING_VELOCITY) {
        drag.value = withTiming(hiddenSign * fullW, { duration: CLOSE_MS });
        scheduleOnRN(onClose);
      } else {
        drag.value = withTiming(0, { duration: SPRING_BACK_MS });
      }
    });

  const scrimStyle = useAnimatedStyle(() => ({ opacity: appear.value }));
  const panelStyle = useAnimatedStyle(() => {
    const w = collapsedW + (fullW - collapsedW) * grow.value;
    const hidden = hiddenSign * w * (1 - appear.value);
    return { width: w, transform: [{ translateX: hidden + drag.value }] };
  });
  const baseStyle = useAnimatedStyle(() => ({ opacity: 1 - grow.value }));
  const expandStyle = useAnimatedStyle(() => ({ opacity: grow.value }));

  if (!mounted) return null;

  const anchor = pinLeft ? styles.anchorLeft : styles.anchorRight;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: scrimColor }, scrimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <GestureDetector gesture={dismiss}>
        <Animated.View
          style={[styles.panel, { backgroundColor: panelColor }, pinLeft ? { left: 0 } : { right: 0 }, panelStyle]}
        >
          {/* Clip window: the layers below are full-final-width and edge-anchored;
              the growing panel uncovers them, so nothing re-flows mid-stretch. */}
          <View style={styles.clip}>
            {children != null && (
              <Animated.View
                style={[styles.layer, anchor, { width: collapsedW }, baseStyle]}
                pointerEvents={expanded ? "none" : "auto"}
              >
                {children}
              </Animated.View>
            )}
            {expandedContent != null && (
              <Animated.View
                style={[styles.layer, anchor, { width: fullW }, expandStyle]}
                pointerEvents={expanded ? "auto" : "none"}
              >
                {expandedContent}
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    shadowColor: "#1B2A4A",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  clip: { flex: 1, overflow: "hidden" },
  layer: { position: "absolute", top: 0, bottom: 0 },
  anchorLeft: { left: 0 },
  anchorRight: { right: 0 },
});
