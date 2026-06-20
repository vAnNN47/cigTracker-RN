/**
 * Welcome / first-run chooser. Two ways in:
 *   1. Continue with Google  → Supabase (cloud, synced). Native sign-in inline;
 *      on success the root gate sees the session and sets dataMode = "supabase".
 *   2. Continue without an account → AsyncStorage (on-device, private). Sets
 *      dataMode = "local" immediately; the gate then loads the local repo and
 *      runs onboarding.
 *
 * Shown by the root gate whenever no data mode has been chosen yet.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { statusCodes } from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStrings } from "@/i18n/useStrings";
import { signInWithGoogle } from "@/lib/googleAuth";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing, type } from "@/theme";

export function WelcomeView() {
  const s = useStrings();
  const setDataMode = useAppStore((st) => st.setDataMode);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setErr(null);
    try {
      await signInWithGoogle();
      // success → onAuthStateChange flips the gate, which sets dataMode.
      // Keep busy until this view unmounts.
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

  const goLocal = () => setDataMode("local");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <View style={styles.logo}>
          <MaterialIcons name="insights" size={36} color={colors.accent} />
        </View>
        <Text style={styles.title}>{s.welcomeHeadline}</Text>
        <Text style={styles.blurb}>{s.welcomeBlurb}</Text>

        <Pressable style={[styles.primaryBtn, busy && styles.disabled]} onPress={signIn} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <>
              <MaterialIcons name="login" size={20} color={colors.onAccent} />
              <Text style={styles.primaryText}>{s.continueWithGoogle}</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.note}>{s.cloudModeNote}</Text>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.or}>{s.orDivider}</Text>
          <View style={styles.line} />
        </View>

        <Pressable style={[styles.outlineBtn, busy && styles.disabled]} onPress={goLocal} disabled={busy}>
          <MaterialIcons name="smartphone" size={18} color={colors.text} />
          <Text style={styles.outlineText}>{s.continueLocally}</Text>
        </Pressable>
        <Text style={styles.note}>{s.localModeNote}</Text>

        {err ? <Text style={styles.err}>{err}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  box: { width: "100%", maxWidth: 380, padding: spacing.xxl, alignItems: "center" },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.text, fontSize: 24, fontFamily: fonts.bold, marginTop: spacing.xl, textAlign: "center" },
  blurb: { color: colors.textDim, fontFamily: fonts.regular, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignSelf: "stretch",
    marginTop: spacing.xxl,
  },
  primaryText: { color: colors.onAccent, fontFamily: fonts.bold, fontSize: type.body.fontSize },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignSelf: "stretch",
  },
  outlineText: { color: colors.text, fontFamily: fonts.semibold, fontSize: type.body.fontSize },
  disabled: { opacity: 0.6 },
  note: { color: colors.textDim, fontSize: 12, fontFamily: fonts.regular, textAlign: "center", marginTop: spacing.sm },

  dividerRow: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", gap: spacing.md, marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: colors.line },
  or: { color: colors.textDim, fontSize: 12, fontFamily: fonts.regular },

  err: { color: colors.bad, fontSize: 12, fontFamily: fonts.regular, textAlign: "center", marginTop: spacing.lg },
});
