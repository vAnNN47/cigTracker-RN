/**
 * Boot splash. Logo fades + scales in once, then breathes (gentle opacity pulse)
 * while the app loads / auth resolves.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { green } from "@/theme";

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
    <View style={styles.center}>
      <Animated.View style={[styles.logo, style]}>
        <MaterialIcons name="insights" size={64} color={green.green} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: green.bg, alignItems: "center", justifyContent: "center" },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: green.cardSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
