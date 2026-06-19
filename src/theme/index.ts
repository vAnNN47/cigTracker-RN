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
  bg: "#16141b", // app background (slate-900)
  surface: "#371f2c", // cards (slate-800)
  surfaceHigh: "#283445", // inputs / raised fills
  text: "#b6b6b6", // primary text // c99fda
  textDim: "#6B7280", // secondary / labels (slate-500)
  accent: "#df8adf", // teal — primary action
  ring: "#9e85e0", // brighter teal for the progress ring
  good: "#555555", // under-limit / positive
  bad: "#FB7185", // over-limit / negative (rose)
  streak: "#FB923C", // day-streak flame (orange)
  line: "rgba(48, 110, 224, 0.08)", // hairline borders / dividers
  /** Faint fill for sub-cards inside a card. */
  fill: "rgba(255,255,255,0.05)",
  /** Progress/ring track. */
  track: "rgba(255,255,255,0.10)",
  /** Translucent accent for active tab indicator + tinted cards. */
  accentSoft: "rgba(20,184,166,0.18)",
  accentTint: "rgba(20,184,166,0.12)",
  accentBorder: "rgba(20,184,166,0.25)",
  /** Text/icon color when placed ON an accent-filled surface. */
  onAccent: "#111827",
} as const;

/** Corner radii, matching the Figma design shapes. */
export const radius = {
  input: 14,
  button: 14,
  card: 16,
  chip: 12, // sub-cards / small fills
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
