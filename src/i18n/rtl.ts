/**
 * Layout-direction (RTL) handling for the Hebrew locale.
 *
 * React Native only re-lays-out for RTL after the JS bundle reloads AND
 * I18nManager.forceRTL has been applied. forceRTL persists natively across
 * restarts, so on a normal cold start the direction is usually already correct
 * and no reload is needed — we only reload when the direction actually flips
 * (i.e. right after the user switches language).
 */
import { getLocales } from "expo-localization";
import { DevSettings, I18nManager } from "react-native";

export type Locale = "device" | "en" | "he";

/**
 * Text alignment for the reading START edge.
 *
 * React Native's `I18nManager.doLeftAndRightSwapInRTL` is ON by default, so in
 * an RTL layout it automatically flips `textAlign: "left"` to "right". Writing
 * "left" therefore yields start-alignment in BOTH directions (plain left in LTR;
 * auto-swapped to right in RTL). Use this on full-width <Text> (titles, section
 * headers, labels) whose default "auto" alignment doesn't follow RTL.
 *
 * (Do NOT set this to "right" in RTL — the swap would flip it back to left.)
 */
export const textStart = "left" as const;

/** Resolve the override locale (or the device language) to a concrete lang. */
export function resolveLang(locale: Locale): "en" | "he" {
  if (locale === "device") {
    const device = getLocales()[0]?.languageCode ?? "en";
    return device === "he" ? "he" : "en";
  }
  return locale;
}

/**
 * Apply the layout direction for a locale. Returns true if the direction
 * actually changed — the caller should then reload so native layout updates.
 */
export function applyDirection(locale: Locale): boolean {
  const he = resolveLang(locale) === "he";
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL === he) return false;
  I18nManager.forceRTL(he);
  return true;
}

/** Reload the JS bundle so a just-applied direction change takes effect. */
export function reloadForDirection() {
  // Dev client: instant reload. In a production build the next cold start
  // picks up the persisted native RTL flag, so a manual restart is enough.
  if (typeof DevSettings?.reload === "function") DevSettings.reload();
}
