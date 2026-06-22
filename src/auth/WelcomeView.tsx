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
import { fonts, green, radius, spacing, type } from "@/theme";

const BAD = "#C0392B";

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
          <MaterialIcons name="insights" size={36} color={green.green} />
        </View>
        <Text style={styles.title}>{s.welcomeHeadline}</Text>
        <Text style={styles.blurb}>{s.welcomeBlurb}</Text>

        <Pressable style={[styles.primaryBtn, busy && styles.disabled]} onPress={signIn} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={green.onGreen} />
          ) : (
            <>
              <MaterialIcons name="login" size={20} color={green.onGreen} />
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
          <MaterialIcons name="smartphone" size={18} color={green.text} />
          <Text style={styles.outlineText}>{s.continueLocally}</Text>
        </Pressable>
        <Text style={styles.note}>{s.localModeNote}</Text>

        {err ? <Text style={styles.err}>{err}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: green.bg, alignItems: "center", justifyContent: "center" },
  box: { width: "100%", maxWidth: 380, padding: spacing.xxl, alignItems: "center" },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: green.cardSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: green.green, fontSize: 24, fontFamily: fonts.bold, marginTop: spacing.xl, textAlign: "center" },
  blurb: { color: green.textDim, fontFamily: fonts.regular, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: green.green,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignSelf: "stretch",
    marginTop: spacing.xxl,
  },
  primaryText: { color: green.onGreen, fontFamily: fonts.bold, fontSize: type.body.fontSize },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: green.card,
    borderWidth: 1,
    borderColor: green.border,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignSelf: "stretch",
  },
  outlineText: { color: green.text, fontFamily: fonts.semibold, fontSize: type.body.fontSize },
  disabled: { opacity: 0.6 },
  note: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular, textAlign: "center", marginTop: spacing.sm },

  dividerRow: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", gap: spacing.md, marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: green.border },
  or: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular },

  err: { color: BAD, fontSize: 12, fontFamily: fonts.regular, textAlign: "center", marginTop: spacing.lg },
});
