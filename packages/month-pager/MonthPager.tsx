/**
 * Horizontally-swipeable month carousel.
 *
 * Why this is flicker-free: months are laid out at STABLE absolute slots keyed
 * to a fixed anchor (slot i = anchor + i months), and only the wrapper's
 * translateX is animated. The centered month is never tied to `focused` at a
 * fixed origin, so committing a page never resets the offset or swaps the page
 * under your finger — the element you were dragging simply becomes the centered
 * one (same React key, no remount). That removes the reset-race that caused the
 * occasional old-month flash.
 *
 * Why fast swiping doesn't get stuck: the month change is committed the instant
 * the gesture ends (not in the slide-animation's completion callback). A new
 * swipe interrupts the in-flight animation, but the commit has already fired, so
 * `focused` keeps advancing. The destination is computed in absolute slot space
 * captured at gesture start, so rapid back-to-back swipes each advance by one
 * month instead of colliding on a stale value.
 *
 * The same model animates external `focused` changes (e.g. header arrows): the
 * prop change just retargets translateX and it slides.
 *
 * Height: measured once from an in-flow render of the first month (the grid is a
 * fixed number of week rows, so height is constant); after that the pager runs
 * in absolute mode at that fixed height.
 *
 * Built from gesture-handler + reanimated (+ worklets for scheduleOnRN), no
 * extra library, matching the other packages here.
 *
 *  - activeOffsetX + failOffsetY let vertical drags fall through to a parent
 *    ScrollView and let taps on day cells register (pan only claims horizontal).
 *  - RTL-aware: the "next" month sits on the left. The strip is pinned LTR so
 *    translateX + slot offsets stay deterministic; each page restores app dir.
 *  - canGoNext / canGoPrev gate paging (e.g. can't swipe into the future) with
 *    rubber-band resistance + snap-back.
 */
import { ReactNode, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const diffMonths = (a: Date, b: Date) =>
  (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());

export interface MonthPagerProps {
  /** First-of-month date currently centered. */
  focused: Date;
  /** Called with the new first-of-month when the user pages. */
  onChange: (next: Date) => void;
  /** Render a month's grid given its first-of-month date. */
  renderMonth: (monthFirst: Date) => ReactNode;
  /** Allow paging to the next (later) month. Default true. */
  canGoNext?: boolean;
  /** Allow paging to the previous (earlier) month. Default true. */
  canGoPrev?: boolean;
  isRTL?: boolean;
}

const TIMING = { duration: 200, easing: Easing.out(Easing.cubic) };
const RADIUS = 3; // months rendered on each side of center (buffer for fast swipes)
const THRESHOLD = 0.22; // fraction of a page to commit
const FLICK = 400; // px/s velocity that commits regardless of distance

export function MonthPager({
  focused,
  onChange,
  renderMonth,
  canGoNext = true,
  canGoPrev = true,
  isRTL = false,
}: MonthPagerProps) {
  const dir = isRTL ? -1 : 1;

  // Stable origin: slot index i maps to (anchor + dir*i) months. Fixed for the
  // component's life so slot positions never move when `focused` changes.
  const anchorRef = useRef(focused);
  const anchor = anchorRef.current;
  const slotOf = (d: Date) => dir * diffMonths(anchor, d);
  const monthForSlot = (i: number) => addMonths(anchor, dir * i);
  const targetK = slotOf(focused);

  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const displayK = useSharedValue(targetK); // current centered slot (float during slide)
  const startK = useSharedValue(targetK); // slot the active gesture started on

  const canRevealLeft = dir > 0 ? canGoPrev : canGoNext; // slot base-1 (physical left)
  const canRevealRight = dir > 0 ? canGoNext : canGoPrev; // slot base+1 (physical right)

  // Slide toward `focused` whenever it changes from the outside (arrows, day
  // taps). After a swipe the animation is already running toward the same slot,
  // so this just keeps things in sync.
  useEffect(() => {
    if (Math.abs(displayK.value - targetK) > 0.001) {
      displayK.value = withTiming(targetK, TIMING);
    }
  }, [targetK, displayK]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w && h && (!size || Math.abs(size.w - w) > 0.5 || Math.abs(size.h - h) > 0.5)) {
      setSize({ w, h });
    }
  };

  const w = size?.w ?? 0;

  // JS-thread: change `focused` to an absolute slot. Uses the stable anchor, so
  // it's correct even if React hasn't re-rendered between rapid swipes yet.
  const commitSlot = (slot: number) => onChange(monthForSlot(slot));

  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onStart(() => {
      startK.value = displayK.value;
    })
    .onChange((e) => {
      if (!w) return;
      let d = e.changeX;
      // Dragging right lowers displayK toward the physical-left slot, and vice
      // versa. Rubber-band when pushing past a blocked edge.
      if (d > 0 && displayK.value <= startK.value && !canRevealLeft) d *= 0.25;
      if (d < 0 && displayK.value >= startK.value && !canRevealRight) d *= 0.25;
      displayK.value -= d / w;
    })
    .onEnd((e) => {
      const base = Math.round(startK.value);
      const moved = displayK.value - startK.value;
      const fast = Math.abs(e.velocityX) > FLICK;
      let dest = base;
      if (moved < -THRESHOLD || (fast && e.velocityX > 0 && moved < 0)) dest = base - 1;
      else if (moved > THRESHOLD || (fast && e.velocityX < 0 && moved > 0)) dest = base + 1;
      // Gate against blocked directions (physical-left is base-1).
      if (dest < base && !canRevealLeft) dest = base;
      if (dest > base && !canRevealRight) dest = base;

      displayK.value = withTiming(dest, TIMING);
      if (dest !== base) scheduleOnRN(commitSlot, dest);
    });

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -displayK.value * w }],
  }));

  const pageDir = isRTL ? "rtl" : "ltr";

  // Phase 1: render the focused month in flow once, to measure width + height.
  if (!size) {
    return (
      <View style={styles.viewport} onLayout={onLayout}>
        <View style={{ direction: pageDir }}>{renderMonth(focused)}</View>
      </View>
    );
  }

  // Phase 2: absolute, virtualized strip at the measured height.
  const slots: number[] = [];
  for (let i = targetK - RADIUS; i <= targetK + RADIUS; i++) slots.push(i);

  return (
    <View style={[styles.viewport, { height: size.h }]} onLayout={onLayout}>
      <GestureDetector gesture={pan}>
        {/* Pinned LTR so translateX + slot offsets are deterministic. */}
        <Animated.View style={[styles.strip, wrapperStyle]}>
          {slots.map((i) => (
            <View
              key={i}
              style={[styles.page, { width: w, left: i * w, direction: pageDir }]}
              pointerEvents={i === targetK ? "auto" : "none"}
            >
              {renderMonth(monthForSlot(i))}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { overflow: "hidden" },
  strip: { flex: 1, direction: "ltr" },
  page: { position: "absolute", top: 0 },
});
