/**
 * Count-vs-limit progress ring — the RN equivalent of Flutter's
 * CircularProgressIndicator in the Today card. Built with react-native-svg.
 */
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { colors } from "@/theme";

interface RingProps {
  size?: number;
  strokeWidth?: number;
  pct: number; // 0..1
  color: string;
  children?: React.ReactNode; // centered content (the count)
}

export function Ring({ size = 84, strokeWidth = 8, pct, color, children }: RingProps) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  const dash = c * clamped;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* track */}
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={strokeWidth} fill="none" />
        {/* progress — start at 12 o'clock, go clockwise */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
