/**
 * Boot splash. Logo fades + scales in once, then breathes (gentle opacity pulse)
 * while the app loads / auth resolves.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { green } from "@/theme";
import { View } from "@/tw";
import { Animated } from "@/tw/animated";

/** Boot splash: logo fades/scales in, then breathes while the app loads. */
export function SplashView() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.86);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 120 });
    opacity.value = withTiming(1, { duration: 550 }, (finished) => {
      if (finished) {
        // breathe: pulse opacity 1 <-> 0.6 forever
        opacity.value = withRepeat(withTiming(0.6, { duration: 1200 }), -1, true);
      }
    });
  }, [opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: green.bg }}>
      <Animated.View
        className="w-[120px] h-[120px] rounded-[28px] items-center justify-center"
        style={[{ backgroundColor: green.cardSoft }, style]}
      >
        <MaterialIcons name="insights" size={64} color={green.green} />
      </Animated.View>
    </View>
  );
}
