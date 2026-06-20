/**
 * Root layout + auth gate.
 *  - USE_SUPABASE: resolve the Supabase session, show Login when signed out,
 *    load data when signed in.
 *  - Show Onboarding on first run (no daily limit yet), then the tabs.
 * The <Stack> stays mounted always (so the router is happy); the splash/login/
 * onboarding render as a full-screen overlay on top of it.
 */
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  useFonts,
} from "@expo-google-fonts/hanken-grotesk";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from "@expo-google-fonts/jetbrains-mono";
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
import { WelcomeView } from "@/auth/WelcomeView";
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
  const dataMode = useAppStore((s) => s.dataMode);
  const setDataMode = useAppStore((s) => s.setDataMode);

  const [modeHydrated, setModeHydrated] = useState(false);
  // session: undefined = resolving, null = signed out, Session = signed in.
  const [session, setSession] = useState<Session | null | undefined>(USE_SUPABASE ? undefined : null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [onboardDone, setOnboardDone] = useState(false);

  // Boot: read the persisted data mode (local / supabase / none).
  useEffect(() => {
    useAppStore.getState().hydrateDataMode().finally(() => setModeHydrated(true));
  }, []);

  // Supabase session — only the "supabase" mode acts on it.
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

  // A Google sign-in started from the welcome screen → adopt supabase mode.
  useEffect(() => {
    if (session && dataMode === null) setDataMode("supabase");
  }, [session, dataMode, setDataMode]);

  // Switching modes (or signing out) forces a fresh load with the new repo.
  useEffect(() => {
    setDataLoaded(false);
    setOnboardDone(false);
  }, [dataMode]);

  const authed = dataMode === "local" || (dataMode === "supabase" && !!session);

  useEffect(() => {
    if (modeHydrated && authed && !dataLoaded) {
      load().then(() => setDataLoaded(true));
    }
  }, [modeHydrated, authed, dataLoaded, load]);

  useEffect(() => {
    if (!modeHydrated) return;
    if (dataMode === null) SplashScreen.hideAsync(); // welcome visible
    else if (dataMode === "supabase" && session === null) SplashScreen.hideAsync(); // login visible
    else if (dataLoaded) SplashScreen.hideAsync();
  }, [modeHydrated, dataMode, session, dataLoaded]);

  let overlay: React.ReactNode = null;
  if (!modeHydrated) overlay = <SplashView />;
  else if (dataMode === null) overlay = <WelcomeView />;
  else if (dataMode === "supabase" && session === undefined) overlay = <SplashView />;
  else if (dataMode === "supabase" && session === null) overlay = <LoginView />;
  else if (!dataLoaded || loading) overlay = <SplashView />;
  else if (limits.length === 0 && !onboardDone)
    overlay = <OnboardingView onDone={() => setOnboardDone(true)} />;

  return (
    <View style={styles.fill}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="edit-log" options={{ presentation: "modal" }} />
        <Stack.Screen name="purchases" />
      </Stack>
      {overlay && <View style={[StyleSheet.absoluteFill, styles.overlay]}>{overlay}</View>}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  // Align layout direction (LTR/RTL) with the saved language before the UI shows.
  useEffect(() => {
    useAppStore.getState().hydrateLocale();
  }, []);

  // Hold the native splash until fonts are ready (keeps the first paint correct).
  if (!fontsLoaded) return null;

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
