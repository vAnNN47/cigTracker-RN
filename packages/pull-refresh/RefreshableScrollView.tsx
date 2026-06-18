/**
 * ScrollView with a custom pull-to-refresh that only triggers when the list is
 * at the TOP and the user pulls down past a tunable threshold (with rubber-band
 * resistance). Normal scrolling works everywhere else.
 *
 * The pull is accumulated from per-frame deltas (changeY) ONLY while scrolled to
 * the top — so scrolling up to the top with a long drag does NOT pre-load the
 * pull / trigger early.
 *
 * Reanimated + gesture-handler (+ worklets for scheduleOnRN). No extra lib.
 */
import { ReactNode, useCallback, useState } from "react";
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

interface RefreshableScrollViewProps {
  children: ReactNode;
  onRefresh: () => void | Promise<void>;
  /** Pull distance (px) required to trigger a refresh. Default 90. */
  threshold?: number;
  /** Drag-to-pull ratio (lower = more resistance / harder pull). Default 0.5. */
  resistance?: number;
  /** Spinner (ActivityIndicator) color. */
  spinnerColor?: string;
  /** Show the spinner indicator while pulling/refreshing. Default true. */
  showSpinner?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function RefreshableScrollView({
  children,
  onRefresh,
  threshold = 90,
  resistance = 0.5,
  spinnerColor = "#888888",
  showSpinner = true,
  style,
  contentContainerStyle,
}: RefreshableScrollViewProps) {
  const [, setRefreshing] = useState(false);

  const scrollY = useSharedValue(0);
  const pull = useSharedValue(0);
  const busy = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const doRefresh = useCallback(async () => {
    setRefreshing(true);
    busy.value = 1;
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      busy.value = 0;
      pull.value = withTiming(0, { duration: 220 });
    }
  }, [onRefresh, busy, pull]);

  const native = Gesture.Native();
  const pan = Gesture.Pan()
    // Only engage after a real downward drag, so micro scroll-events on a slow
    // pull don't fight the native scroll (kills the slow-pull jitter).
    .activeOffsetY(12)
    .onChange((e) => {
      if (busy.value === 1) return;
      // Genuinely scrolled into content (epsilon avoids 1px flicker at top).
      if (scrollY.value > 2) {
        if (pull.value !== 0) pull.value = 0;
        return;
      }
      // At the top: accumulate the pull from per-frame deltas, starting at 0.
      const next = pull.value + e.changeY * resistance;
      pull.value = Math.max(0, Math.min(threshold * 1.8, next));
    })
    .onEnd(() => {
      if (busy.value === 1) return;
      if (pull.value >= threshold) {
        pull.value = withTiming(threshold, { duration: 120 });
        scheduleOnRN(doRefresh);
      } else {
        pull.value = withTiming(0, { duration: 180 });
      }
    });
  const gesture = Gesture.Simultaneous(pan, native);

  const contentStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pull.value }] }));
  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, pull.value / threshold),
    transform: [{ translateY: pull.value - 30 }],
  }));

  return (
    <View style={[styles.fill, style]}>
      {showSpinner && (
        <Animated.View style={[styles.spinner, spinnerStyle]} pointerEvents="none">
          <ActivityIndicator color={spinnerColor} />
        </Animated.View>
      )}
      <GestureDetector gesture={gesture}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          alwaysBounceVertical={false}
          overScrollMode="never"
          contentContainerStyle={contentContainerStyle}
          style={contentStyle}
        >
          {children}
        </Animated.ScrollView>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: "hidden" },
  spinner: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", paddingTop: 8, zIndex: 1 },
});
