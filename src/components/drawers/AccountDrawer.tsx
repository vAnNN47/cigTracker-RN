/**
 * Account drawer — full-screen, opens from the LEFT (the avatar is on the left).
 * Account status + Notifications / About / Feedback / Privacy. Sub-screens
 * (Language, FAQ, Privacy policy, Terms) live INSIDE the drawer as nested panels
 * that slide in from the left, so their back button returns to the drawer (not
 * the app). Feedback opens mail; Rate / Troubleshooting / Privacy settings are
 * stubbed.
 */
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
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
const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

type Sub = "none" | "language" | "faq" | "privacy" | "terms";

export function AccountDrawer() {
  const s = useStrings();
  const open = useDrawerStore((st) => st.open) === "account";
  const hide = useDrawerStore((st) => st.hide);
  const dataMode = useAppStore((st) => st.dataMode);
  const setDataMode = useAppStore((st) => st.setDataMode);

  const [email, setEmail] = useState<string | null>(null);
  const [sub, setSub] = useState<Sub>("none");
  const signedIn = dataMode === "supabase";

  useEffect(() => {
    if (open && signedIn) {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    }
  }, [open, signedIn]);

  // Reset to the account list whenever the drawer closes.
  useEffect(() => {
    if (!open) setSub("none");
  }, [open]);

  const version = Constants.expoConfig?.version ?? "1.0.0";
  const backIcon = I18nManager.isRTL ? "chevron-right" : "chevron-left";
  const stub = (title: string) => Alert.alert(title, s.comingSoon);

  const subTitle =
    sub === "language" ? s.language : sub === "faq" ? s.faq : sub === "privacy" ? s.privacyPolicy : s.termsOfService;

  return (
    <SlideDrawer open={open} forceSide="left" widthPct={1} onClose={hide}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={hide} hitSlop={8} style={styles.iconBtn}>
            <MaterialIcons name={backIcon} size={26} color={green.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{s.account}</Text>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }} alwaysBounceVertical>
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

          <Section title={s.notifications}>
            <Row icon="notifications-none" label={s.notifications} value={s.statusOff} />
          </Section>

          <Section title={s.about}>
            <Row icon="info-outline" label={s.version} value={version} />
            <Row icon="language" label={s.language} onPress={() => setSub("language")} />
            <Row icon="help-outline" label={s.faq} onPress={() => setSub("faq")} />
            <Row
              icon="ios-share"
              label={s.shareApp}
              onPress={() => Share.share({ message: s.shareMessage }).catch(() => {})}
            />
          </Section>

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

          <Section title={s.privacy}>
            <Row icon="security" label={s.privacySettings} onPress={() => stub(s.privacySettings)} />
            <Row icon="privacy-tip" label={s.privacyPolicy} onPress={() => setSub("privacy")} />
            <Row icon="description" label={s.termsOfService} onPress={() => setSub("terms")} />
          </Section>
        </ScrollView>
      </SafeAreaView>

      {/* Sub-screen: slides in from the LEFT over the list; back returns to the drawer. */}
      {sub !== "none" && (
        <SlideDrawer open forceSide="left" widthPct={1} onClose={() => setSub("none")}>
          <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <View style={styles.header}>
              <Pressable onPress={() => setSub("none")} hitSlop={8} style={styles.iconBtn}>
                <MaterialIcons name={backIcon} size={26} color={green.text} />
              </Pressable>
              <Text style={styles.headerTitle}>{subTitle}</Text>
              <View style={styles.iconBtn} />
            </View>
            {sub === "language" ? (
              <LanguageList onDone={() => setSub("none")} />
            ) : (
              <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}>
                <Text style={styles.doc}>{LOREM}</Text>
              </ScrollView>
            )}
          </SafeAreaView>
        </SlideDrawer>
      )}
    </SlideDrawer>
  );
}

function LanguageList({ onDone }: { onDone: () => void }) {
  const s = useStrings();
  const locale = useAppStore((st) => st.locale);
  const setLocale = useAppStore((st) => st.setLocale);
  const langs: { key: "device" | "en" | "he" | "ru" | "ar" | "es"; label: string; ready: boolean }[] = [
    { key: "device", label: s.device, ready: true },
    { key: "en", label: s.english, ready: true },
    { key: "he", label: s.hebrew, ready: true },
    { key: "ru", label: s.russian, ready: false },
    { key: "ar", label: s.arabic, ready: false },
    { key: "es", label: s.spanish, ready: false },
  ];
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <View style={styles.sectionBody}>
        {langs.map((l) => {
          const selected = l.ready && locale === l.key;
          return (
            <Pressable
              key={l.key}
              style={styles.langRow}
              onPress={() => {
                if (!l.ready) {
                  Alert.alert(s.language, s.comingSoon);
                  return;
                }
                setLocale(l.key as "device" | "en" | "he");
                onDone();
              }}
            >
              <Text style={[styles.langLabel, !l.ready && styles.langLabelMuted]}>{l.label}</Text>
              {selected ? (
                <MaterialIcons name="check" size={20} color={green.green} />
              ) : !l.ready ? (
                <Text style={styles.soon}>{s.comingSoon}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
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
  safe: { flex: 1, backgroundColor: green.bg, paddingHorizontal: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm },
  iconBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
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
    marginTop: spacing.sm,
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

  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: green.border,
  },
  langLabel: { color: green.text, fontSize: 16, fontFamily: fonts.semibold, textAlign: textStart },
  langLabelMuted: { color: green.textDim },
  soon: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular },

  doc: { color: green.textSecondary, fontSize: 15, fontFamily: fonts.regular, lineHeight: 24, textAlign: textStart, paddingTop: spacing.sm },
});
