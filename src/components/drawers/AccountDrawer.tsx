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
import { Alert, I18nManager, Linking, Share, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SettingsView } from "@/app/settings";
import { SlideDrawer } from "@/components/drawers/SlideDrawer";
import { resolveLang, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useColors } from "@/theme";
import { Pressable, ScrollView, Text, View } from "@/tw";

const FEEDBACK_EMAIL = "leetbeck@gmail.com";
const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

type Sub = "none" | "language" | "theme" | "settings" | "faq" | "privacy" | "terms";

/** Avatar-side drawer: account status, Settings, and About/Privacy/Feedback sub-panels. */
export function AccountDrawer() {
  const s = useStrings();
  const green = useColors();
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
      <SafeAreaView style={{ flex: 1, backgroundColor: green.bg, paddingHorizontal: 16 }} edges={["top", "bottom"]}>
        <View className="flex-row items-center py-2">
          <Pressable onPress={hide} hitSlop={8} className="w-8 h-8 items-center justify-center" accessibilityRole="button" accessibilityLabel={s.a11yBack}>
            <MaterialIcons name={backIcon} size={26} color={green.text} />
          </Pressable>
          <Text className="flex-1 text-text text-[18px] font-bold text-center">{s.account}</Text>
          <View className="w-8 h-8 items-center justify-center" />
        </View>

        <ScrollView contentContainerClassName="px-4 pb-6" alwaysBounceVertical>
          {/* Account status */}
          <View className="flex-row items-center gap-3 bg-card border border-border rounded-[16px] p-4 mt-2">
            <View className="w-14 h-14 rounded-[28px] items-center justify-center">
              <MaterialIcons name="account-circle" size={48} color={green.green} />
            </View>
            <View className="flex-1">
              <Text className="text-text text-[16px] font-bold" style={{ textAlign: textStart }}>{signedIn ? s.signedIn : s.guest}</Text>
              <Text className="text-text-dim text-[13px] font-regular mt-0.5" style={{ textAlign: textStart }}>{signedIn ? email ?? s.signedIn : s.notSignedIn}</Text>
            </View>
            {!signedIn && (
              <Pressable
                className="bg-green rounded-[14px] px-4 py-2"
                onPress={() => {
                  hide();
                  setDataMode(null);
                }}
              >
                <Text className="text-on-green text-[13px] font-bold">{s.signedIn}</Text>
              </Pressable>
            )}
          </View>

          {/* Settings — opens as a panel from the drawer's own edge, so it
              slides from the same side as the drawer in both languages. */}
          <View className="bg-card border border-border rounded-[14px] overflow-hidden mt-4">
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
          <SafeAreaView style={{ flex: 1, backgroundColor: green.bg, paddingHorizontal: 16 }} edges={["top", "bottom"]}>
            <View className="flex-row items-center py-2">
              <Pressable onPress={() => setSub("none")} hitSlop={8} className="w-8 h-8 items-center justify-center" accessibilityRole="button" accessibilityLabel={s.a11yBack}>
                <MaterialIcons name={backIcon} size={26} color={green.text} />
              </Pressable>
              <Text className="flex-1 text-text text-[18px] font-bold text-center">{subTitle}</Text>
              <View className="w-8 h-8 items-center justify-center" />
            </View>
            {shownSub === "language" ? (
              <LanguageList onDone={() => setSub("none")} />
            ) : shownSub === "theme" ? (
              <ThemeList onDone={() => setSub("none")} />
            ) : (
              <ScrollView contentContainerClassName="px-5 pb-6">
                <Text className="text-text-secondary text-[15px] font-regular leading-6 pt-2" style={{ textAlign: textStart }}>{LOREM}</Text>
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
    <ScrollView contentContainerClassName="px-4 pb-6">
      <View className="bg-card border border-border rounded-[14px] overflow-hidden mt-2">
        {orderedReady.map((l) => {
          const selected = effective === l.key;
          return (
            <Pressable
              key={l.key}
              className="flex-row items-center justify-between px-4 py-3"
              style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: green.border }}
              onPress={() => {
                setLocale(l.key);
                onDone();
              }}
            >
              <Text className={`text-[16px] ${selected ? "text-green font-bold" : "text-text font-semibold"}`} style={{ textAlign: textStart }}>{l.label}</Text>
              {selected ? <MaterialIcons name="check" size={20} color={green.green} /> : null}
            </Pressable>
          );
        })}
        {soon.map((l) => (
          <Pressable
            key={l.label}
            className="flex-row items-center justify-between px-4 py-3"
            style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: green.border }}
            onPress={() => Alert.alert(s.language, s.comingSoon)}
          >
            <Text className="text-[16px] text-text-dim font-semibold" style={{ textAlign: textStart }}>{l.label}</Text>
            <Text className="text-text-dim text-[12px] font-regular">{s.comingSoon}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function ThemeList({ onDone }: { onDone: () => void }) {
  const s = useStrings();
  const green = useColors();
  const themeMode = useAppStore((st) => st.themeMode);
  const setThemeMode = useAppStore((st) => st.setThemeMode);
  const opts: { key: "device" | "light" | "dark"; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "device", label: s.themeDevice, icon: "smartphone" },
    { key: "light", label: s.themeLight, icon: "light-mode" },
    { key: "dark", label: s.themeDark, icon: "dark-mode" },
  ];
  return (
    <ScrollView contentContainerClassName="px-4 pb-6">
      <View className="bg-card border border-border rounded-[14px] overflow-hidden mt-2">
        {opts.map((o) => {
          const selected = themeMode === o.key;
          return (
            <Pressable
              key={o.key}
              className="flex-row items-center justify-between px-4 py-3"
              style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: green.border }}
              onPress={() => {
                setThemeMode(o.key);
                onDone();
              }}
            >
              <View className="flex-row items-center gap-3">
                <MaterialIcons name={o.icon} size={20} color={selected ? green.green : green.textDim} />
                <Text className={`text-[16px] ${selected ? "text-green font-bold" : "text-text font-semibold"}`} style={{ textAlign: textStart }}>{o.label}</Text>
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
  return (
    <View className="mt-5">
      <Text className="text-text-dim text-[12px] font-medium uppercase tracking-[1.2px] mb-2 ms-1" style={{ textAlign: textStart }}>{title}</Text>
      <View className="bg-card border border-border rounded-[14px] overflow-hidden mt-2">{children}</View>
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
  return (
    <Pressable
      className="flex-row items-center gap-3 px-3 py-3"
      style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: green.border }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="w-8 h-8 rounded-[16px] bg-card-soft items-center justify-center">
        <MaterialIcons name={icon} size={20} color={green.green} />
      </View>
      <Text className="flex-1 text-text text-[15px] font-regular" style={{ textAlign: textStart }}>{label}</Text>
      {value ? <Text className="text-text-dim text-[14px] font-mono-medium">{value}</Text> : null}
      {onPress ? <MaterialIcons name="chevron-right" size={20} color={green.textDim} /> : null}
    </Pressable>
  );
}
