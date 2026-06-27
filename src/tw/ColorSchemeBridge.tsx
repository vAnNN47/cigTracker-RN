/**
 * Bridges the app's persisted theme mode (Zustand `themeMode`: device/light/dark)
 * to React Native's `Appearance`, which is what NativeWind's `light-dark()` and
 * `dark:` variant key off. Lets a user-forced light/dark override the OS scheme,
 * matching the legacy `useColors()` behaviour during the StyleSheet → NativeWind
 * migration. Render once near the app root.
 */
import { useEffect } from "react";
import { Appearance } from "react-native";

import { useAppStore } from "@/store/useAppStore";

/** Pushes the store's theme mode into RN Appearance so NativeWind themes follow it. */
export function ColorSchemeBridge() {
  const mode = useAppStore((s) => s.themeMode);
  useEffect(() => {
    // "device" → "unspecified" = follow the OS scheme; otherwise force the choice.
    Appearance.setColorScheme(mode === "device" ? "unspecified" : mode);
  }, [mode]);
  return null;
}
