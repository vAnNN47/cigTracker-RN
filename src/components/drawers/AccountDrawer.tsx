/**
 * Account drawer — full-screen, opens from the reading END edge (the avatar sits
 * on the end of the top bar): left in Hebrew (RTL), right in English (LTR).
 * Account status + Settings + Notifications / About / Feedback / Privacy.
 * Sub-screens (Language, Theme, FAQ, Privacy policy, Terms) live INSIDE the
 * drawer as nested panels that slide in from the SAME end edge, so their back
 * button returns to the drawer (not the app). Feedback opens mail; Rate /
 * Troubleshooting / Privacy settings are stubbed.
 */
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { ReactNode, useEffect, useState } from "react";
import { Alert, I18nManager, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SettingsView } from "@/app/settings";
import { SlideDrawer } from "@/components/drawers/SlideDrawer";
import { resolveLang, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { fonts, makeUseStyles, spacing, useColors } from "@/theme";

const FEEDBACK_EMAIL = "leetbeck@gmail.com";
const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

type Sub = "none" | "language" | "theme" | "settings" | "faq" | "privacy" | "terms";

/** Avatar-side drawer: account status, Settings, and About/Privacy/Feedback sub-panels. */
export function AccountDrawer() {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
  const open = useDrawerStore((st) => st.open) === "account";
  const hide = useDrawerStore((st) => st.hide);
  const dataMode = useAppStore((st) => st.dataMode);
  const setDataMode = useAppStore((st) => st.setDataMode);

  const [email, setEmail] = useState<string | null>(null);
  const [sub, setSub] = useState<Sub>("none");
  // The sub view keeps rendering through the slide-OUT (sub flips to "none" to
  // animate closed, but the panel content stays until it's fully gone).
  const [shownSub, setShownSub] = useState<Exclude<Sub, "none">>("language");
  const openSub = (v: Exclude<Sub, "none">) => {
    setShownSub(v);
    setSub(v);
  };
  const signedIn = dataMode === "supabase";

  useEffect(() => {
    if (open && signedIn) {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    }
  }, [open, signedIn]);

  // Reset to the account list whenever the drawer closes (during render, so the
  // list is already shown the next time it opens — no stale sub-panel frame).
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setSub("none");
  }

  const version = Constants.expoConfig?.version ?? "1.0.0";
  const backIcon = I18nManager.isRTL ? "chevron-right" : "chevron-left";
  const stub = (title: string) => Alert.alert(title, s.comingSoon);

  const subTitle =
    shownSub === "language"
      ? s.language
      : shownSub === "theme"
        ? s.appearance
        : shownSub === "faq"
          ? s.faq
          : shownSub === "privacy"
            ? s.privacyPolicy
            : s.termsOfService;

  return (
    <SlideDrawer open={open} side="end" widthPct={1} onClose={hide}>
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

          {/* Settings — opens as a panel from the drawer's own edge, so it
              slides from the same side as the drawer in both languages. */}
          <View style={styles.settingsCard}>
            <Row icon="settings" label={s.settings} onPress={() => openSub("settings")} />
          </View>

          <Section title={s.notifications}>
            <Row icon="notifications-none" label={s.notifications} value={s.statusOff} />
          </Section>

          <Section title={s.about}>
            <Row icon="info-outline" label={s.version} value={version} />
            <Row icon="palette" label={s.appearance} onPress={() => openSub("theme")} />
            <Row icon="language" label={s.language} onPress={() => openSub("language")} />
            <Row icon="help-outline" label={s.faq} onPress={() => openSub("faq")} />
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
            <Row icon="privacy-tip" label={s.privacyPolicy} onPress={() => openSub("privacy")} />
            <Row icon="description" label={s.termsOfService} onPress={() => openSub("terms")} />
          </Section>
        </ScrollView>
      </SafeAreaView>

      {/* Sub-screen: slides in (and out) from the drawer's own end edge over the
          list; back returns to the drawer. Always mounted + open-toggled so the
          close animates. Settings renders its own header, so it skips the
          generic wrapper. */}
      <SlideDrawer open={sub !== "none"} side="end" widthPct={1} onClose={() => setSub("none")}>
        {shownSub === "settings" ? (
          <SettingsView onClose={() => setSub("none")} />
        ) : (
          <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <View style={styles.header}>
              <Pressable onPress={() => setSub("none")} hitSlop={8} style={styles.iconBtn}>
                <MaterialIcons name={backIcon} size={26} color={green.text} />
              </Pressable>
              <Text style={styles.headerTitle}>{subTitle}</Text>
              <View style={styles.iconBtn} />
            </View>
            {shownSub === "language" ? (
              <LanguageList onDone={() => setSub("none")} />
            ) : shownSub === "theme" ? (
              <ThemeList onDone={() => setSub("none")} />
            ) : (
              <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}>
                <Text style={styles.doc}>{LOREM}</Text>
              </ScrollView>
            )}
          </SafeAreaView>
        )}
      </SlideDrawer>
    </SlideDrawer>
  );
}

function LanguageList({ onDone }: { onDone: () => void }) {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
  const locale = useAppStore((st) => st.locale);
  const setLocale = useAppStore((st) => st.setLocale);

  // No "Device" entry — the chosen (effective) language floats to the top,
  // highlighted; coming-soon languages stay disabled below (task 19).
  const effective = locale === "device" ? resolveLang("device") : locale;
  const ready: { key: "en" | "he"; label: string }[] = [
    { key: "en", label: s.english },
    { key: "he", label: s.hebrew },
  ];
  const orderedReady = [...ready].sort((a, b) => (a.key === effective ? -1 : b.key === effective ? 1 : 0));
  const soon: { label: string }[] = [{ label: s.russian }, { label: s.arabic }, { label: s.spanish }];

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <View style={styles.sectionBody}>
        {orderedReady.map((l) => {
          const selected = effective === l.key;
          return (
            <Pressable
              key={l.key}
              style={styles.langRow}
              onPress={() => {
                setLocale(l.key);
                onDone();
              }}
            >
              <Text style={[styles.langLabel, selected && styles.langLabelSel]}>{l.label}</Text>
              {selected ? <MaterialIcons name="check" size={20} color={green.green} /> : null}
            </Pressable>
          );
        })}
        {soon.map((l) => (
          <Pressable key={l.label} style={styles.langRow} onPress={() => Alert.alert(s.language, s.comingSoon)}>
            <Text style={[styles.langLabel, styles.langLabelMuted]}>{l.label}</Text>
            <Text style={styles.soon}>{s.comingSoon}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function ThemeList({ onDone }: { onDone: () => void }) {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
  const themeMode = useAppStore((st) => st.themeMode);
  const setThemeMode = useAppStore((st) => st.setThemeMode);
  const opts: { key: "device" | "light" | "dark"; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "device", label: s.themeDevice, icon: "smartphone" },
    { key: "light", label: s.themeLight, icon: "light-mode" },
    { key: "dark", label: s.themeDark, icon: "dark-mode" },
  ];
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}>
      <View style={styles.sectionBody}>
        {opts.map((o) => {
          const selected = themeMode === o.key;
          return (
            <Pressable
              key={o.key}
              style={styles.langRow}
              onPress={() => {
                setThemeMode(o.key);
                onDone();
              }}
            >
              <View style={styles.themeLeft}>
                <MaterialIcons name={o.icon} size={20} color={selected ? green.green : green.textDim} />
                <Text style={[styles.langLabel, selected && styles.langLabelSel]}>{o.label}</Text>
              </View>
              {selected ? <MaterialIcons name="check" size={20} color={green.green} /> : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
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
  const green = useColors();
  const styles = useStyles();
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

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
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

  settingsCard: {
    backgroundColor: green.card,
    borderWidth: 1,
    borderColor: green.border,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: spacing.lg,
  },
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
  langLabelSel: { color: green.green, fontFamily: fonts.bold },
  themeLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  langLabelMuted: { color: green.textDim },
  soon: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular },

  doc: { color: green.textSecondary, fontSize: 15, fontFamily: fonts.regular, lineHeight: 24, textAlign: textStart, paddingTop: spacing.sm },
  }),
);
