/**
 * Resolves the active string table from the Settings locale override, falling
 * back to the device language. (RTL via I18nManager comes in Step 7.)
 */
import { getLocales } from "expo-localization";
import { useMemo } from "react";

import { useAppStore } from "@/store/useAppStore";

import { makeStrings } from "./strings";

/** The active string table for the chosen locale (or the device language). */
export function useStrings() {
  const locale = useAppStore((s) => s.locale);
  return useMemo(() => {
    const device = getLocales()[0]?.languageCode ?? "en";
    const lang = locale === "device" ? device : locale;
    return makeStrings(lang === "he");
  }, [locale]);
}
