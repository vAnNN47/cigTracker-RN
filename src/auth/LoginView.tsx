/**
 * Login — ported from lib/screens/login_screen.dart, but NATIVE Google sign-in
 * (account picker, no browser) via signInWithGoogle -> signInWithIdToken.
 * On success the root auth gate re-renders; no manual navigation needed.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { statusCodes } from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStrings } from "@/i18n/useStrings";
import { signInWithGoogle } from "@/lib/googleAuth";
import { colors, radius, spacing, type } from "@/theme";

export function LoginView() {
  const s = useStrings();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setErr(null);
    try {
      await signInWithGoogle();
      // success -> onAuthStateChange flips the gate; keep busy until unmount
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = (e as any)?.code;
      if (code !== statusCodes.SIGN_IN_CANCELLED && code !== statusCodes.IN_PROGRESS) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setErr(String((e as any)?.message ?? e));
      }
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <View style={styles.logo}>
          <MaterialIcons name="insights" size={36} color={colors.accent} />
        </View>
        <Text style={styles.title}>{s.appName}</Text>
        <Text style={styles.tagline}>{s.loginTagline}</Text>

        <Pressable
          style={[styles.btn, busy && styles.btnDisabled]}
          onPress={signIn}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <>
              <MaterialIcons name="login" size={20} color={colors.onAccent} />
              <Text style={styles.btnText}>{s.continueWithGoogle}</Text>
            </>
          )}
        </Pressable>

        {err ? <Text style={styles.err}>{err}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  box: { width: "100%", maxWidth: 360, padding: spacing.xxl, alignItems: "center" },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.text, fontSize: 24, fontWeight: "700", marginTop: spacing.xxl },
  tagline: { color: colors.textDim, textAlign: "center", marginTop: spacing.sm },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignSelf: "stretch",
    marginTop: spacing.xxl + spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.onAccent, fontWeight: "600", fontSize: type.body.fontSize },
  err: { color: colors.bad, fontSize: 12, textAlign: "center", marginTop: spacing.lg },
});
