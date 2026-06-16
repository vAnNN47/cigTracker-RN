/**
 * Custom bottom sheet, Flutter-style keyboard behaviour, identical on iOS/Android.
 *
 * RULE 1 — keyboard PUSHES, doesn't resize: the sheet keeps its content height
 *   and rides up on top of the keyboard. This is delegated to
 *   react-native-keyboard-controller's <KeyboardStickyView>, which translates
 *   its child up by the keyboard height in sync with the native keyboard.
 *
 * RULE 2 — drag dismiss: dragging is a pure Reanimated translate (independent of
 *   the keyboard, so no race). On release: past the threshold / fast flick →
 *   animate out + dismiss keyboard; otherwise spring back.
 *
 * Rendered through a root <Portal> (not RN Modal) so it sits in the main window
 * where keyboard-controller can see the keyboard. Imperative API: present/dismiss.
 */
import { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { BackHandler, LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  KeyboardController,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, radius, spacing } from "@/theme";

import { Portal } from "./Portal";
import { SheetDragContext } from "./sheetDragContext";

export interface BottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface BottomSheetProps {
  children: ReactNode;
  onDismiss?: () => void;
}

const SPRING = { damping: 24, stiffness: 260, mass: 0.7 };
const DISMISS_DRAG = 110; // px dragged down to dismiss
const FLICK_VELOCITY = 900; // px/s downward flick always dismisses

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet({ children, onDismiss }, ref) {
    const insets = useSafeAreaInsets();
    const { height: keyboardHeight, progress } = useReanimatedKeyboardAnimation();
    const [mounted, setMounted] = useState(false);

    const sheetHeight = useSharedValue(0);
    const open = useSharedValue(0); // 0 = hidden below, 1 = resting
    const drag = useSharedValue(0); // downward drag offset (>= 0)

    const finishDismiss = useCallback(() => {
      setMounted(false);
      onDismiss?.();
    }, [onDismiss]);

    const dismiss = useCallback(() => {
      KeyboardController.dismiss();
      drag.value = withTiming(0, { duration: 220 });
      open.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) runOnJS(finishDismiss)();
      });
    }, [drag, open, finishDismiss]);

    const present = useCallback(() => {
      drag.value = 0;
      setMounted(true);
    }, [drag]);

    useImperativeHandle(ref, () => ({ present, dismiss }));

    // Android hardware back closes the sheet.
    useEffect(() => {
      if (!mounted) return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        dismiss();
        return true;
      });
      return () => sub.remove();
    }, [mounted, dismiss]);

    const onLayout = (e: LayoutChangeEvent) => {
      // Only measure for the entry slide; ignore later layout changes (e.g. the
      // animated bottom padding) so we don't do JS work every frame.
      if (open.value !== 0) return;
      const h = e.nativeEvent.layout.height;
      if (h > 0) sheetHeight.value = h;
      open.value = withSpring(1, SPRING);
    };

    const pan = useMemo(
      () =>
        Gesture.Pan()
          .activeOffsetY(12) // a downward drag started anywhere (incl. inputs)
          .failOffsetX([-20, 20]) // grabs the sheet; horizontal swipes don't
          .onUpdate((e) => {
            drag.value = Math.max(0, e.translationY);
          })
          .onEnd((e) => {
            // Threshold = the keyboard's edge: drag past ~the keyboard to close;
            // short of that, snap back above the keyboard.
            const kb = keyboardHeight.value;
            const threshold = kb > 0 ? kb * 0.6 : DISMISS_DRAG;
            if (drag.value > threshold || e.velocityY > FLICK_VELOCITY) {
              runOnJS(dismiss)();
            } else {
              drag.value = withSpring(0, SPRING);
            }
          }),
      [dismiss, drag, keyboardHeight],
    );

    // Entry slide + drag only — the keyboard push is handled by KeyboardStickyView.
    const sheetStyle = useAnimatedStyle(() => {
      const hiddenOffset = (1 - open.value) * (sheetHeight.value || 800);
      // Bottom padding: full safe-area clearance when the keyboard is closed,
      // shrinking to 0 as it opens so the Save button rests on the keyboard.
      const closedPad = insets.bottom + spacing.lg;
      const paddingBottom = closedPad * (1 - progress.value);
      return { transform: [{ translateY: hiddenOffset + drag.value }], paddingBottom };
    });

    const backdropStyle = useAnimatedStyle(() => {
      const dragFade =
        sheetHeight.value > 0 ? 1 - Math.min(1, drag.value / sheetHeight.value) : 1;
      return { opacity: open.value * 0.5 * dragFade };
    });

    if (!mounted) return null;

    return (
      <Portal>
        <Pressable style={styles.fill} onPress={dismiss}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        <KeyboardStickyView style={styles.stickyWrap}>
          <GestureDetector gesture={pan}>
            <Animated.View onLayout={onLayout} style={[styles.sheet, sheetStyle]}>
              <View style={styles.grabber} />
              <SheetDragContext.Provider value={pan}>{children}</SheetDragContext.Provider>
            </Animated.View>
          </GestureDetector>
        </KeyboardStickyView>
      </Portal>
    );
  },
);

const styles = StyleSheet.create({
  fill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000" },
  stickyWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: spacing.sm,
  },
});
