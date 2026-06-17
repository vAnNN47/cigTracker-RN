/**
 * KeyboardSheet — a Flutter-style bottom sheet that behaves identically on iOS
 * and Android, with correct keyboard handling:
 *
 *  RULE 1 — keyboard PUSHES, doesn't resize: the sheet keeps its content height
 *    and rides up on top of the keyboard (via KeyboardStickyView). The last
 *    element rests on the keyboard (bottom padding animates to 0 on open).
 *  RULE 2 — drag dismiss vs the keyboard edge, decided on RELEASE (drag is a
 *    pure Reanimated translate, independent of the keyboard, so no race).
 *
 * Inputs inside the sheet must use <SheetTextInput> (same folder) so a drag
 * started on a field dismisses the sheet without a keyboard flash.
 *
 * Requirements at the app root (once):
 *   <GestureHandlerRootView style={{flex:1}}>
 *     <KeyboardProvider>
 *       <SafeAreaProvider>
 *         {app}
 *         <PortalHost />        // from ./Portal
 *       </SafeAreaProvider>
 *     </KeyboardProvider>
 *   </GestureHandlerRootView>
 *
 * Usage:
 *   const ref = useRef<KeyboardSheetRef>(null);
 *   <Pressable onPress={() => ref.current?.present()}><Text>Open</Text></Pressable>
 *   <KeyboardSheet ref={ref} backgroundColor="#16181D" handleColor="#262A31">
 *     <SheetTextInput placeholder="Comment" />
 *     ...
 *   </KeyboardSheet>
 */
import {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { BackHandler, LayoutChangeEvent, Platform, StyleSheet, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  KeyboardController,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import { Portal } from "./Portal";
import { SheetDragContext } from "./sheetDragContext";

export interface KeyboardSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface KeyboardSheetProps {
  children: ReactNode;
  onDismiss?: () => void;
  /** Sheet surface color. */
  backgroundColor?: string;
  /** Grabber handle color. */
  handleColor?: string;
  /** Top corner radius. */
  cornerRadius?: number;
  /** Backdrop color + max opacity. */
  backdropColor?: string;
  backdropOpacity?: number;
  /** Breathing room (px) left below the last element when it rests on the keyboard. */
  keyboardSpacing?: number;
  /**
   * Dismiss behaviour on drag release:
   *  - "keyboard": Flutter-style — close only when the sheet's top edge (grabber)
   *    is dragged down to the keyboard's top edge (see `dragDismissFraction`).
   *  - "swipe": Android-style — close on any short downward swipe past
   *    `swipeDismissDistance`.
   * @default Platform.OS === "ios" ? "keyboard" : "swipe"
   */
  dismissMode?: "keyboard" | "swipe";
  /**
   * "keyboard" mode only. How far to drag before release dismisses, as a fraction
   * of the SHEET's own height. At 1, the grabber is dragged all the way to the
   * keyboard's top edge before closing; lower closes with less drag. Default 0.9.
   */
  dragDismissFraction?: number;
  /** "swipe" mode only. Downward drag distance (px) that dismisses. Default 80. */
  swipeDismissDistance?: number;
  /** Extra style for the inner content container. */
  contentStyle?: ViewStyle;
}

const SPRING = { damping: 24, stiffness: 260, mass: 0.7 };
const DISMISS_DRAG = 110; // px dragged down to dismiss (when no keyboard)
const FLICK_VELOCITY = 900; // px/s downward flick always dismisses

export const KeyboardSheet = forwardRef<KeyboardSheetRef, KeyboardSheetProps>(
  function KeyboardSheet(
    {
      children,
      onDismiss,
      backgroundColor = "#1b1b1f",
      handleColor = "#3a3a3f",
      cornerRadius = 24,
      backdropColor = "#000",
      backdropOpacity = 0.5,
      keyboardSpacing = 12,
      dismissMode = Platform.OS === "ios" ? "keyboard" : "swipe",
      dragDismissFraction = 0.9,
      swipeDismissDistance = 80,
      contentStyle,
    },
    ref,
  ) {
    const insets = useSafeAreaInsets();
    const { progress } = useReanimatedKeyboardAnimation();
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
        if (finished) scheduleOnRN(finishDismiss);
      });
    }, [drag, open, finishDismiss]);

    const present = useCallback(() => {
      drag.value = 0;
      setMounted(true);
    }, [drag]);

    useImperativeHandle(ref, () => ({ present, dismiss }));

    useEffect(() => {
      if (!mounted) return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        dismiss();
        return true;
      });
      return () => sub.remove();
    }, [mounted, dismiss]);

    const onLayout = (e: LayoutChangeEvent) => {
      if (open.value !== 0) return; // only measure for the entry slide
      const h = e.nativeEvent.layout.height;
      if (h > 0) sheetHeight.value = h;
      open.value = withSpring(1, SPRING);
    };

    const pan = useMemo(
      () =>
        Gesture.Pan()
          .activeOffsetY(12)
          .failOffsetX([-20, 20])
          .onUpdate((e) => {
            drag.value = Math.max(0, e.translationY);
          })
          .onEnd((e) => {
            let threshold: number;
            if (dismissMode === "swipe") {
              // Android-style: any short downward swipe closes.
              threshold = swipeDismissDistance;
            } else {
              // Flutter-style: the sheet rests with its bottom edge on the
              // keyboard's top edge, so the grabber (top edge) sits one
              // sheet-height above it. Dragging down by ~the sheet height brings
              // the grabber to the keyboard's top edge -> dismiss. Same px space
              // as `drag`, so it's exact.
              const sh = sheetHeight.value;
              threshold = sh > 0 ? sh * dragDismissFraction : DISMISS_DRAG;
            }
            if (drag.value > threshold || e.velocityY > FLICK_VELOCITY) {
              scheduleOnRN(dismiss);
            } else {
              drag.value = withSpring(0, SPRING);
            }
          }),
      [dismiss, drag, sheetHeight, dismissMode, dragDismissFraction, swipeDismissDistance],
    );

    const sheetStyle = useAnimatedStyle(() => {
      const hiddenOffset = (1 - open.value) * (sheetHeight.value || 800);
      const closedPad = insets.bottom + 16;
      // Rests on the keyboard with `keyboardSpacing` breathing room when open;
      // full safe-area clearance when closed.
      const paddingBottom = keyboardSpacing + (closedPad - keyboardSpacing) * (1 - progress.value);
      return { transform: [{ translateY: hiddenOffset + drag.value }], paddingBottom };
    });

    const backdropStyle = useAnimatedStyle(() => {
      const dragFade =
        sheetHeight.value > 0 ? 1 - Math.min(1, drag.value / sheetHeight.value) : 1;
      return { opacity: open.value * backdropOpacity * dragFade };
    });

    if (!mounted) return null;

    return (
      <Portal>
        <Animated.View
          style={[styles.backdrop, { backgroundColor: backdropColor }, backdropStyle]}
          onTouchEnd={dismiss}
        />
        <KeyboardStickyView style={styles.stickyWrap}>
          <GestureDetector gesture={pan}>
            <Animated.View
              onLayout={onLayout}
              style={[
                styles.sheet,
                { backgroundColor, borderTopLeftRadius: cornerRadius, borderTopRightRadius: cornerRadius },
                sheetStyle,
                contentStyle,
              ]}
            >
              <View style={[styles.grabber, { backgroundColor: handleColor }]} />
              <SheetDragContext.Provider value={pan}>{children}</SheetDragContext.Provider>
            </Animated.View>
          </GestureDetector>
        </KeyboardStickyView>
      </Portal>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  stickyWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  sheet: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  grabber: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
});
