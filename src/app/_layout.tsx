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
import "@/global.css";

import { Session } from "@supabase/supabase-js";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoginView } from "@/auth/LoginView";
import { OnboardingView } from "@/auth/OnboardingView";
import { SplashView } from "@/auth/SplashView";
import { WelcomeView } from "@/auth/WelcomeView";
import { AccountDrawer } from "@/components/drawers/AccountDrawer";
import { MainDrawer } from "@/components/drawers/MainDrawer";
import { ToastProvider } from "@/components/feedback/Toast";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { USE_SUPABASE } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import { ColorSchemeBridge, View } from "@/tw";
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

  // Switching modes (or signing out) forces a fresh load with the new repo —
  // reset during render (not in an effect) so there's no stale-data frame.
  const [prevMode, setPrevMode] = useState(dataMode);
  if (prevMode !== dataMode) {
    setPrevMode(dataMode);
    setDataLoaded(false);
    setOnboardDone(false);
  }

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
    <View className="flex-1 bg-bg">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="edit-log" options={{ presentation: "modal" }} />
        <Stack.Screen name="purchases" />
        <Stack.Screen name="settings" />
      </Stack>
      {overlay && <View className="absolute inset-0 z-10">{overlay}</View>}
      {/* Slide-in drawers render above everything (incl. the tab bar). */}
      <MainDrawer />
      <AccountDrawer />
    </View>
  );
}

/** Root layout + auth gate: splash/login/onboarding overlay above the always-mounted Stack. */
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

  // Align layout direction (LTR/RTL) with the saved language before the UI shows,
  // and restore the saved theme mode (device / light / dark).
  useEffect(() => {
    useAppStore.getState().hydrateLocale();
    useAppStore.getState().hydrateThemeMode();
  }, []);

  // Hold the native splash until fonts are ready (keeps the first paint correct).
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <ColorSchemeBridge />
            <ThemedStatusBar />
            <Gate />
            <PortalHost />
          </ToastProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

// Light icons on the dark theme, dark icons on the light theme.
function ThemedStatusBar() {
  const mode = useAppStore((s) => s.themeMode);
  const scheme = useColorScheme();
  const isDark = mode === "dark" || (mode === "device" && scheme === "dark");
  return <StatusBar style={isDark ? "light" : "dark"} />;
}
