/**
 * A lightweight slide-in drawer panel: scrim backdrop (tap to close) + a panel
 * that slides in from the start or end edge. RTL-aware (start = right in Hebrew).
 * Width is a fraction of the screen, so 1.0 gives a full-screen drawer.
 */
import { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, I18nManager, Pressable, StyleSheet, View } from "react-native";

import { makeUseStyles } from "@/theme";

interface SlideDrawerProps {
  open: boolean;
  side?: "start" | "end";
  forceSide?: "left" | "right"; // override the RTL-derived side
  widthPct?: number; // 0..1 of the screen width
  onClose: () => void;
  children: ReactNode;
}

export function SlideDrawer({ open, side = "start", forceSide, widthPct = 0.78, onClose, children }: SlideDrawerProps) {
  const styles = useStyles();
  const screenW = Dimensions.get("window").width;
  const panelW = Math.round(screenW * widthPct);
  const physicalSide: "left" | "right" =
    forceSide ?? (side === "start" ? (I18nManager.isRTL ? "right" : "left") : I18nManager.isRTL ? "left" : "right");
  // RN auto-swaps the `left`/`right` style props in RTL, so to actually pin the
  // panel to `physicalSide` we choose the key that lands there AFTER the swap.
  // (transform translateX is NOT swapped, so the slide offset stays physical.)
  const pinLeft = (physicalSide === "left") !== I18nManager.isRTL;
  const hidden = physicalSide === "left" ? -panelW : panelW;

  const tx = useRef(new Animated.Value(hidden)).current;
  const scrim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(tx, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(scrim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(tx, { toValue: hidden, duration: 220, useNativeDriver: true }),
        Animated.timing(scrim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: scrim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.panel,
          pinLeft ? { left: 0 } : { right: 0 },
          { width: panelW, transform: [{ translateX: tx }] },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
    scrim: { backgroundColor: "rgba(9,29,46,0.45)" },
    panel: {
      position: "absolute",
      top: 0,
      bottom: 0,
      backgroundColor: green.bg,
      shadowColor: "#1B2A4A",
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
      elevation: 16,
    },
  }),
);
