/**
 * Design tokens — "haze" redesign (periwinkle, calm, dark).
 *
 * Existing color keys are kept (remapped to the new palette) so screens that
 * haven't been redesigned yet keep resolving; new keys (status, tag, text tiers)
 * are added for the redesigned screens. Redesigned screens use exact spec px for
 * radius/spacing and pull colors + fonts from here.
 *
 * Usage:
 *   import { colors, fonts, radius, spacing } from "@/theme";
 */

export const colors = {
  // Surfaces
  bg: "#0e1116", // app surface
  surface: "#171b21", // sheets / raised cards
  surfaceHigh: "#1b2027", // inputs / steppers

  // Text tiers
  text: "#e6e8eb", // primary
  textSecondary: "#c4c9d0", // secondary
  textDim: "#868d97", // muted (most labels)
  textFaint: "#5a626c", // faint

  // Accent — periwinkle
  accent: "#8b9bf5",
  accentText: "#aeb8f8", // text/number on tinted accent surfaces
  onAccent: "#0b0e1a", // text/icon on a solid accent fill
  accentTint: "rgba(139,155,245,0.16)",
  accentSoft: "rgba(139,155,245,0.18)",
  accentBorder: "rgba(139,155,245,0.35)",
  accentBorderStrong: "rgba(139,155,245,0.5)",

  // Status (count vs allowance)
  under: "#8b9bf5", // under limit = primary
  atLimit: "#e0b06a", // exactly at limit = amber
  over: "#e08a8a", // over limit = red
  overText: "#e8a3a3", // over text in calendar cells

  // Legacy aliases (kept so not-yet-redesigned screens still resolve)
  ring: "#8b9bf5",
  good: "#8b9bf5",
  bad: "#e08a8a",
  streak: "#8b9bf5",

  // Lines / fills
  line: "rgba(255,255,255,0.08)",
  fill: "rgba(255,255,255,0.05)",
  track: "rgba(255,255,255,0.07)",

  // Location tag colors
  tagHome: "#8b9bf5",
  tagWork: "#7fb8c9",
  tagCar: "#e0a98a",
  tagSocial: "#c69ce0",
} as const;

/** Font families (loaded via @expo-google-fonts in the root layout). */
export const fonts = {
  regular: "HankenGrotesk_400Regular",
  medium: "HankenGrotesk_500Medium",
  semibold: "HankenGrotesk_600SemiBold",
  bold: "HankenGrotesk_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
  monoSemibold: "JetBrainsMono_600SemiBold",
} as const;

/** Corner radii (haze). */
export const radius = {
  input: 16,
  button: 16,
  card: 13,
  cell: 11, // calendar day cells
  chip: 12, // small fills
  pill: 20, // chips / segmented pills
  stepper: 10,
  sheet: 28,
} as const;

/** Spacing scale (kept stable so legacy screens don't shift). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Typography presets. */
export const type = {
  title: { fontSize: 22, fontFamily: fonts.bold },
  body: { fontSize: 14, fontFamily: fonts.regular },
  label: { fontSize: 12, fontFamily: fonts.medium },
  tabLabel: { fontSize: 10, fontFamily: fonts.medium },
} as const;

export const theme = { colors, fonts, radius, spacing, type } as const;

export type AppColors = typeof colors;
export type Theme = typeof theme;
