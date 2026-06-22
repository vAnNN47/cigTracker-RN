/**
 * A lightweight slide-in drawer panel: scrim backdrop (tap to close) + a panel
 * that slides in from the start or end edge. RTL-aware (start = right in Hebrew).
 * Width is a fraction of the screen, so 1.0 gives a full-screen drawer.
 */
import { ReactNode, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, I18nManager, Pressable, StyleSheet, View } from "react-native";

import { green } from "@/theme";

interface SlideDrawerProps {
  open: boolean;
  side?: "start" | "end";
  widthPct?: number; // 0..1 of the screen width
  onClose: () => void;
  children: ReactNode;
}

export function SlideDrawer({ open, side = "start", widthPct = 0.78, onClose, children }: SlideDrawerProps) {
  const screenW = Dimensions.get("window").width;
  const panelW = Math.round(screenW * widthPct);
  const physicalSide: "left" | "right" =
    side === "start" ? (I18nManager.isRTL ? "right" : "left") : I18nManager.isRTL ? "left" : "right";
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
          physicalSide === "left" ? { left: 0 } : { right: 0 },
          { width: panelW, transform: [{ translateX: tx }] },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
