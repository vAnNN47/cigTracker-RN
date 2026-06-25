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
 *
 * Dark theme: screens read their palette through `useColors()` (light `green`
 * or `dark`, resolved from the persisted theme mode + device scheme) and build
 * their StyleSheet via `makeUseStyles((green) => ...)`, so a single import
 * swap turns any screen theme-reactive without renaming every `green.x` ref.
 */
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAppStore } from "@/store/useAppStore";

/** Light "haze" palette — legacy keys remapped + new status/tag/text tiers. */
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

/**
 * "v2" light/green palette (design handoff: 2000s-style, calm, navigable).
 * Lives alongside the dark `colors` while screens migrate one at a time.
 */
export const green = {
  bg: "#F7F9FF", // app surface
  card: "#FFFFFF", // raised cards
  cardSoft: "#E3EFFF", // soft-blue cards (quote, pills, buttons-in-card)
  border: "rgba(187,203,187,0.3)", // hairline card border (#BBCBBB @ 30%)

  text: "#091D2E", // primary
  textSecondary: "#3D4A3E",
  textDim: "#6C7B6D", // muted

  green: "#006D37", // deep green — titles, numbers, primary button
  greenBright: "#2ECC71", // bright green — savings card, active tab
  greenDeep: "#005027", // text/icon on bright green
  onGreen: "#FFFFFF", // text on the deep-green button
  dot: "#4AE183", // recent-entry dot

  ring: "#D1E4FB", // hero circle fill
  ringStroke: "#C9DCF3",
} as const;

/**
 * Dark counterpart of the `green` palette — identical keys, so any screen that
 * reads its colors through `useColors()` flips cleanly. Tuned to the same calm
 * mint-green character: vivid accent on deep, faintly-green near-black surfaces.
 */
export const dark = {
  bg: "#0E1411", // app surface
  card: "#161D18", // raised cards
  cardSoft: "#1C2620", // soft cards (quote, pills, buttons-in-card)
  border: "rgba(173,200,180,0.16)", // hairline card border

  text: "#EAF1EC", // primary
  textSecondary: "#BCC8BF",
  textDim: "#7C887F", // muted

  green: "#46D17F", // accent — titles, numbers, icons, primary button
  greenBright: "#2ECC71", // bright green — savings card, active tab
  greenDeep: "#062B1A", // text/icon on bright green
  onGreen: "#04231A", // text on the (light) accent button
  dot: "#4AE183", // recent-entry dot

  ring: "#15241C", // hero circle fill
  ringStroke: "#284536",
} as const;

/** A theme palette — light (`green`) and `dark` share this shape. */
export type Palette = { [K in keyof typeof green]: string };

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

/** All design tokens bundled together (colors, fonts, radius, spacing, type). */
export const theme = { colors, fonts, radius, spacing, type } as const;

export type AppColors = typeof colors;
export type Theme = typeof theme;

export type ThemeMode = "device" | "light" | "dark";

/** True when the dark palette should apply (forced dark, or OS dark under "device"). */
export function useIsDark(): boolean {
  const mode = useAppStore((s) => s.themeMode);
  const scheme = useColorScheme();
  return mode === "dark" || (mode === "device" && scheme === "dark");
}

/** The active palette (light `green` or `dark`) for the current theme mode. */
export function useColors(): Palette {
  return (useIsDark() ? dark : green) as Palette;
}

/**
 * Build a theme-reactive StyleSheet hook. The factory runs at most once per
 * palette (cached by the stable palette object), so calling the returned hook
 * from many components is cheap.
 *
 *   const useStyles = makeUseStyles((green) => StyleSheet.create({ ... }));
 *   function Screen() { const styles = useStyles(); ... }
 */
export function makeUseStyles<T>(factory: (c: Palette) => T): () => T {
  const cache = new WeakMap<Palette, T>();
  return function useStyles(): T {
    const c = useColors();
    let built = cache.get(c);
    if (!built) {
      built = factory(c);
      cache.set(c, built);
    }
    return built;
  };
}
