/**
 * Welcome / first-run chooser. Two ways in:
 *   1. Continue with Google  → Supabase (cloud, synced). Native sign-in inline;
 *      on success the root gate sees the session and sets dataMode = "supabase".
 *   2. Continue without an account → AsyncStorage (on-device, private). Sets
 *      dataMode = "local" immediately; the gate then loads the local repo and
 *      runs onboarding.
 *
 * Shown in the device language by default; a small language picker lets the user
 * switch before continuing. Light/dark themed.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { statusCodes } from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { resolveLang } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { signInWithGoogle } from "@/lib/googleAuth";
import { useAppStore } from "@/store/useAppStore";
import { useColors } from "@/theme";
import { Pressable, Text, View } from "@/tw";

import { LegalFooter } from "./LegalFooter";

/** First-run chooser: continue with Google (cloud) or without an account (local). */
export function WelcomeView() {
  const s = useStrings();
  const green = useColors();
  const setDataMode = useAppStore((st) => st.setDataMode);
  const locale = useAppStore((st) => st.locale);
  const setLocale = useAppStore((st) => st.setLocale);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const effectiveLang = locale === "device" ? resolveLang("device") : locale;
  const langs: { key: "en" | "he"; label: string }[] = [
    { key: "en", label: s.english },
    { key: "he", label: s.hebrew },
  ];

  const signIn = async () => {
    setBusy(true);
    setErr(null);
    try {
      await signInWithGoogle();
      // success → onAuthStateChange flips the gate, which sets dataMode.
      // Keep busy until this view unmounts.
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code !== statusCodes.SIGN_IN_CANCELLED && code !== statusCodes.IN_PROGRESS) {
        setErr(String((e as { message?: string })?.message ?? e));
      }
      setBusy(false);
    }
  };

  const goLocal = () => setDataMode("local");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: green.bg, alignItems: "center", justifyContent: "center" }}>
      <View className="w-full max-w-[380px] p-6 items-center">
        {/* Language picker (task: choose language on the welcome screen) */}
        <View className="flex-row gap-2 mb-5">
          {langs.map((l) => {
            const sel = effectiveLang === l.key;
            return (
              <Pressable
                key={l.key}
                onPress={() => !sel && setLocale(l.key)}
                className={`px-4 py-2 rounded-pill border ${sel ? "bg-green border-green" : "bg-card-soft border-border"}`}
              >
                <Text className={`${sel ? "text-on-green" : "text-text-dim"} text-[13px] font-semibold`}>{l.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View className="w-[72px] h-[72px] rounded-[22px] bg-card-soft items-center justify-center">
          <MaterialIcons name="insights" size={36} color={green.green} />
        </View>
        <Text className="text-green text-[24px] font-bold mt-5 text-center">{s.welcomeHeadline}</Text>
        <Text className="text-text-dim font-regular text-center mt-2 leading-5">{s.welcomeBlurb}</Text>

        <Pressable
          className={`flex-row items-center justify-center gap-2 bg-green rounded-button py-[14px] self-stretch mt-6${busy ? " opacity-60" : ""}`}
          onPress={signIn}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={green.onGreen} />
          ) : (
            <>
              <MaterialIcons name="login" size={20} color={green.onGreen} />
              <Text className="text-on-green font-bold text-[14px]">{s.continueWithGoogle}</Text>
            </>
          )}
        </Pressable>
        <Text className="text-text-dim text-[12px] font-regular text-center mt-2">{s.cloudModeNote}</Text>

        <View className="flex-row items-center self-stretch gap-3 my-5">
          <View className="flex-1 h-px bg-border" />
          <Text className="text-text-dim text-[12px] font-regular">{s.orDivider}</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        <Pressable
          className={`flex-row items-center justify-center gap-2 bg-card border border-border rounded-button py-[14px] self-stretch${busy ? " opacity-60" : ""}`}
          onPress={goLocal}
          disabled={busy}
        >
          <MaterialIcons name="smartphone" size={18} color={green.text} />
          <Text className="text-text font-semibold text-[14px]">{s.continueLocally}</Text>
        </Pressable>
        <Text className="text-text-dim text-[12px] font-regular text-center mt-2">{s.localModeNote}</Text>

        {err ? <Text className="text-error text-[12px] font-regular text-center mt-4">{err}</Text> : null}

        <LegalFooter />
      </View>
    </SafeAreaView>
  );
}
