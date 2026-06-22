/**
 * Account drawer (full-screen, opens from the avatar). Account status +
 * Notifications / About / Feedback / Privacy sections. FAQ / Privacy policy /
 * Terms open in-app doc screens; Feedback opens a mail composer; Rate /
 * Troubleshooting / Privacy settings are stubbed for now.
 */
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { Alert, I18nManager, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SlideDrawer } from "@/components/SlideDrawer";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { fonts, green, spacing } from "@/theme";

const FEEDBACK_EMAIL = "leetbeck@gmail.com";

export function AccountDrawer() {
  const s = useStrings();
  const router = useRouter();
  const open = useDrawerStore((st) => st.open) === "account";
  const hide = useDrawerStore((st) => st.hide);
  const dataMode = useAppStore((st) => st.dataMode);
  const setDataMode = useAppStore((st) => st.setDataMode);

  const [email, setEmail] = useState<string | null>(null);
  const signedIn = dataMode === "supabase";

  useEffect(() => {
    if (open && signedIn) {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    }
  }, [open, signedIn]);

  const version = Constants.expoConfig?.version ?? "1.0.0";
  const go = (path: string) => {
    hide();
    router.push(path as never);
  };
  const stub = (title: string) => Alert.alert(title, s.comingSoon);

  return (
    <SlideDrawer open={open} forceSide="right" widthPct={1} onClose={hide}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={hide} hitSlop={8} style={styles.closeBtn}>
            <MaterialIcons name={I18nManager.isRTL ? "chevron-right" : "chevron-left"} size={26} color={green.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{s.account}</Text>
          <View style={styles.closeBtn} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }} alwaysBounceVertical>
          {/* Account status */}
          <View style={styles.accountCard}>
            <View style={styles.avatar}>
              <MaterialIcons name="account-circle" size={48} color={green.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{signedIn ? s.signedIn : s.guest}</Text>
              <Text style={styles.accountSub}>{signedIn ? email ?? s.signedIn : s.notSignedIn}</Text>
            </View>
            {!signedIn && (
              <Pressable
                style={styles.signInBtn}
                onPress={() => {
                  hide();
                  setDataMode(null);
                }}
              >
                <Text style={styles.signInText}>{s.signedIn}</Text>
              </Pressable>
            )}
          </View>

          {/* Notifications */}
          <Section title={s.notifications}>
            <Row icon="notifications-none" label={s.notifications} value={s.statusOff} />
          </Section>

          {/* About */}
          <Section title={s.about}>
            <Row icon="info-outline" label={s.version} value={version} />
            <Row icon="language" label={s.language} onPress={() => go("/language")} />
            <Row icon="help-outline" label={s.faq} onPress={() => go("/faq")} />
            <Row
              icon="ios-share"
              label={s.shareApp}
              onPress={() => Share.share({ message: s.shareMessage }).catch(() => {})}
            />
          </Section>

          {/* Feedback */}
          <Section title={s.feedback}>
            <Row
              icon="mail-outline"
              label={s.sendFeedback}
              onPress={() =>
                Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent("Cig Tracker feedback")}`).catch(
                  () => {},
                )
              }
            />
            <Row icon="star-outline" label={s.rateApp} onPress={() => stub(s.rateApp)} />
            <Row icon="build" label={s.troubleshooting} onPress={() => stub(s.troubleshooting)} />
          </Section>

          {/* Privacy */}
          <Section title={s.privacy}>
            <Row icon="security" label={s.privacySettings} onPress={() => stub(s.privacySettings)} />
            <Row icon="privacy-tip" label={s.privacyPolicy} onPress={() => go("/privacy")} />
            <Row icon="description" label={s.termsOfService} onPress={() => go("/terms")} />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </SlideDrawer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowIcon}>
        <MaterialIcons name={icon} size={20} color={green.green} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <MaterialIcons name="chevron-right" size={20} color={green.textDim} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm },
  closeBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: green.text, fontSize: 18, fontFamily: fonts.bold, textAlign: "center" },

  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: green.card,
    borderWidth: 1,
    borderColor: green.border,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  accountName: { color: green.text, fontSize: 16, fontFamily: fonts.bold, textAlign: textStart },
  accountSub: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },
  signInBtn: { backgroundColor: green.green, borderRadius: 14, paddingHorizontal: spacing.lg, paddingVertical: 8 },
  signInText: { color: green.onGreen, fontSize: 13, fontFamily: fonts.bold },

  section: { marginTop: spacing.xl },
  sectionTitle: {
    color: green.textDim,
    fontSize: 12,
    fontFamily: fonts.medium,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginStart: spacing.xs,
    textAlign: textStart,
  },
  sectionBody: {
    backgroundColor: green.card,
    borderWidth: 1,
    borderColor: green.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: green.border,
  },
  rowIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: green.cardSoft, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, color: green.text, fontSize: 15, fontFamily: fonts.regular, textAlign: textStart },
  rowValue: { color: green.textDim, fontSize: 14, fontFamily: fonts.monoMedium },
});
