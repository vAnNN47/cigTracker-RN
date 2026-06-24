/**
 * SlideDrawer — a lightweight slide-in drawer panel with a scrim backdrop and an
 * RTL-aware physical side (start = right in Hebrew, left in English).
 *
 * Two things make it more than a plain drawer:
 *  - EXPAND IN PLACE: it opens at `widthPct` (e.g. 0.76) and, when `expanded`
 *    flips true, the SAME panel grows to full screen and cross-fades from
 *    `children` to `expandedContent` — so a list tap feels like the drawer
 *    becoming a full screen (with your own back button) rather than a second
 *    panel sliding over the first. Collapsing reverses it back to `widthPct`.
 *  - SIDE STAYS PHYSICAL: it always opens from its own edge (RTL → right,
 *    LTR → left) and grows from that same edge, in both 70% and 100% states.
 *
 * App-agnostic: colors come in as props (`panelColor` / `scrimColor`); no theme
 * import. Width animates on the UI thread via Reanimated.
 *
 * Peer deps: react-native-reanimated, react-native-worklets.
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
  /** Scrim tap / hardware-back while collapsed. */
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
  // (translateX is NOT swapped, so the hidden offset stays physical.)
  const pinLeft = (physicalSide === "left") !== I18nManager.isRTL;
  const hiddenSign = physicalSide === "left" ? -1 : 1;

  const appear = useSharedValue(open ? 1 : 0); // 0 = off-screen, 1 = resting
  const grow = useSharedValue(expanded ? 1 : 0); // 0 = collapsed, 1 = full screen
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
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

  const scrimStyle = useAnimatedStyle(() => ({ opacity: appear.value }));
  const panelStyle = useAnimatedStyle(() => {
    const w = collapsedW + (fullW - collapsedW) * grow.value;
    return { width: w, transform: [{ translateX: hiddenSign * w * (1 - appear.value) }] };
  });
  const baseStyle = useAnimatedStyle(() => ({ opacity: 1 - grow.value }));
  const expandStyle = useAnimatedStyle(() => ({ opacity: grow.value }));

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: scrimColor }, scrimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[styles.panel, { backgroundColor: panelColor }, pinLeft ? { left: 0 } : { right: 0 }, panelStyle]}
      >
        {children != null && (
          <Animated.View style={[StyleSheet.absoluteFill, baseStyle]} pointerEvents={expanded ? "none" : "auto"}>
            {children}
          </Animated.View>
        )}
        {expandedContent != null && (
          <Animated.View style={[StyleSheet.absoluteFill, expandStyle]} pointerEvents={expanded ? "auto" : "none"}>
            {expandedContent}
          </Animated.View>
        )}
      </Animated.View>
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
});
