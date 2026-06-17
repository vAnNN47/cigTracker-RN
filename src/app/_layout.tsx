/**
 * Root layout: providers + initial data load + native splash control.
 * Loads the Zustand store once, hides the splash when data is ready, and wraps
 * everything in gesture/safe-area/toast providers.
 */
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "@/components/Toast";
import { useAppStore } from "@/store/useAppStore";
// All sheets (Today + Demo) use the standalone package, so we mount its
// PortalHost once (the "root setup" step from packages/keyboard-sheet/README).
import { PortalHost } from "../../packages/keyboard-sheet";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const load = useAppStore((s) => s.load);
  const loading = useAppStore((s) => s.loading);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
            <PortalHost />
          </ToastProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
