/**
 * Design tokens — ported 1:1 from the Flutter app (lib/theme/app_theme.dart).
 * Minimal 2026 style: near-black surfaces, soft off-white text, one mint accent,
 * generous radius, no clutter. Dark-only (matches the native builds).
 *
 * Usage:
 *   import { colors, radius, spacing, type } from "@/theme";
 *   <View style={{ backgroundColor: colors.surface, borderRadius: radius.card }} />
 */

export const colors = {
  bg: "#0E0F12", // app background
  surface: "#16181D", // cards
  surfaceHigh: "#1E2127", // inputs / raised fills
  text: "#F2F3F5", // primary text
  textDim: "#9AA0AA", // secondary / labels
  accent: "#00ec86", // calm mint — primary action
  good: "#6CE5B1", // under-limit / positive (same mint)
  bad: "#FF7A7A", // over-limit / negative
  line: "#262A31", // hairline borders / dividers
  /** Translucent accent used for the active tab indicator (alpha 0.18). */
  accentSoft: "rgba(108, 229, 177, 0.18)",
  /** Text/icon color when placed ON an accent-filled surface (= bg). */
  onAccent: "#0E0F12",
} as const;

/** Corner radii, matching each Flutter widget shape. */
export const radius = {
  input: 14,
  button: 16,
  card: 20,
  sheet: 28, // bottom-sheet top corners
} as const;

/** 4pt spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Typography presets pulled from the Flutter ThemeData text styles. */
export const type = {
  title: { fontSize: 20, fontWeight: "600" },
  body: { fontSize: 16, fontWeight: "400" },
  label: { fontSize: 13, fontWeight: "500" },
  tabLabel: { fontSize: 11, fontWeight: "500" },
} as const;

/** Convenience bundle if you'd rather import one object. */
export const theme = { colors, radius, spacing, type } as const;

export type AppColors = typeof colors;
export type Theme = typeof theme;
