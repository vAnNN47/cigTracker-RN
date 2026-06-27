/**
 * Login with NATIVE Google sign-in (account picker, no browser) via
 * signInWithGoogle -> signInWithIdToken. On success the root auth gate
 * re-renders; no manual navigation needed.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { statusCodes } from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStrings } from "@/i18n/useStrings";
import { signInWithGoogle } from "@/lib/googleAuth";
import { useColors } from "@/theme";
import { Pressable, Text, View } from "@/tw";

import { LegalFooter } from "./LegalFooter";

/** Signed-out screen with native Google sign-in; the root gate re-renders on success. */
export function LoginView() {
  const s = useStrings();
  const green = useColors();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setErr(null);
    try {
      await signInWithGoogle();
      // success -> onAuthStateChange flips the gate; keep busy until unmount
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code !== statusCodes.SIGN_IN_CANCELLED && code !== statusCodes.IN_PROGRESS) {
        setErr(String((e as { message?: string })?.message ?? e));
      }
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: green.bg, alignItems: "center", justifyContent: "center" }}>
      <View className="w-full max-w-[360px] p-6 items-center">
        <View className="w-[72px] h-[72px] rounded-[22px] bg-card-soft items-center justify-center">
          <MaterialIcons name="insights" size={36} color={green.green} />
        </View>
        <Text className="text-green text-[24px] font-bold mt-6">{s.appName}</Text>
        <Text className="text-text-dim font-regular text-center mt-2">{s.loginTagline}</Text>

        <Pressable
          className={`flex-row items-center justify-center gap-2 bg-green rounded-button py-[14px] self-stretch mt-9${busy ? " opacity-60" : ""}`}
          onPress={signIn}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={green.onGreen} />
          ) : (
            <>
              <MaterialIcons name="login" size={20} color={green.onGreen} />
              <Text className="text-on-green font-semibold text-[14px]">{s.continueWithGoogle}</Text>
            </>
          )}
        </Pressable>

        {err ? <Text className="text-error text-[12px] font-regular text-center mt-4">{err}</Text> : null}

        <LegalFooter />
      </View>
    </SafeAreaView>
  );
}
