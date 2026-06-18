/**
 * Root layout + auth gate.
 *  - USE_SUPABASE: resolve the Supabase session, show Login when signed out,
 *    load data when signed in.
 *  - Show Onboarding on first run (no daily limit yet), then the tabs.
 * The <Stack> stays mounted always (so the router is happy); the splash/login/
 * onboarding render as a full-screen overlay on top of it.
 */
import { Session } from "@supabase/supabase-js";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoginView } from "@/auth/LoginView";
import { OnboardingView } from "@/auth/OnboardingView";
import { SplashView } from "@/auth/SplashView";
import { ToastProvider } from "@/components/Toast";
import { USE_SUPABASE } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import { PortalHost } from "../../packages/keyboard-sheet";

SplashScreen.preventAutoHideAsync();

function Gate() {
  const load = useAppStore((s) => s.load);
  const loading = useAppStore((s) => s.loading);
  const limits = useAppStore((s) => s.limits);

  // session: undefined = resolving, null = signed out, Session = signed in.
  const [session, setSession] = useState<Session | null | undefined>(USE_SUPABASE ? undefined : null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [onboardDone, setOnboardDone] = useState(false);

  useEffect(() => {
    if (!USE_SUPABASE) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setDataLoaded(false);
        setOnboardDone(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const authed = USE_SUPABASE ? !!session : true;

  useEffect(() => {
    if (authed && !dataLoaded) {
      load().then(() => setDataLoaded(true));
    }
  }, [authed, dataLoaded, load]);

  useEffect(() => {
    if (dataLoaded) SplashScreen.hideAsync();
    else if (USE_SUPABASE && session === null) SplashScreen.hideAsync(); // login visible
  }, [dataLoaded, session]);

  let overlay: React.ReactNode = null;
  if (USE_SUPABASE && session === undefined) overlay = <SplashView />;
  else if (USE_SUPABASE && session === null) overlay = <LoginView />;
  else if (!dataLoaded || loading) overlay = <SplashView />;
  else if (limits.length === 0 && !onboardDone)
    overlay = <OnboardingView onDone={() => setOnboardDone(true)} />;

  return (
    <View style={styles.fill}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="edit-log" options={{ presentation: "modal" }} />
      </Stack>
      {overlay && <View style={[StyleSheet.absoluteFill, styles.overlay]}>{overlay}</View>}
    </View>
  );
}

export default function RootLayout() {
  // Align layout direction (LTR/RTL) with the saved language before the UI shows.
  useEffect(() => {
    useAppStore.getState().hydrateLocale();
  }, []);

  return (
    <GestureHandlerRootView style={styles.fill}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <Gate />
            <PortalHost />
          </ToastProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: { zIndex: 10 },
});
