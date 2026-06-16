/**
 * Resolves the active string table from the device locale.
 * Step 7 will add a Settings override (Device / English / עברית) + RTL; for now
 * we read the device language and pick Hebrew vs English.
 */
import { getLocales } from "expo-localization";
import { useMemo } from "react";

import { makeStrings } from "./strings";

export function useStrings() {
  return useMemo(() => {
    const lang = getLocales()[0]?.languageCode ?? "en";
    return makeStrings(lang === "he");
  }, []);
}
