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
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { resolveLang } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { signInWithGoogle } from "@/lib/googleAuth";
import { useAppStore } from "@/store/useAppStore";
import { fonts, makeUseStyles, radius, spacing, type, useColors } from "@/theme";

import { LegalFooter } from "./LegalFooter";

/** First-run chooser: continue with Google (cloud) or without an account (local). */
export function WelcomeView() {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        {/* Language picker (task: choose language on the welcome screen) */}
        <View style={styles.langRow}>
          {langs.map((l) => {
            const sel = effectiveLang === l.key;
            return (
              <Pressable
                key={l.key}
                onPress={() => !sel && setLocale(l.key)}
                style={[styles.langChip, sel && styles.langChipSel]}
              >
                <Text style={[styles.langText, sel && styles.langTextSel]}>{l.label}</Text>
              </Pressable>
            );
          })}
        </View>

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

        <LegalFooter />
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: green.bg, alignItems: "center", justifyContent: "center" },
    box: { width: "100%", maxWidth: 380, padding: spacing.xxl, alignItems: "center" },

    langRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
    langChip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: green.cardSoft,
      borderWidth: 1,
      borderColor: green.border,
    },
    langChipSel: { backgroundColor: green.green, borderColor: green.green },
    langText: { color: green.textDim, fontSize: 13, fontFamily: fonts.semibold },
    langTextSel: { color: green.onGreen },

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

    err: { color: green.error, fontSize: 12, fontFamily: fonts.regular, textAlign: "center", marginTop: spacing.lg },
  }),
);
