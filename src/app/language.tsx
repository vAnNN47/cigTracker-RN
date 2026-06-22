/**
 * Language picker (opened from Account → Language). Device / English / Hebrew are
 * functional; Russian / Arabic / Spanish are placeholders for now.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { fonts, green, spacing } from "@/theme";

type LangKey = "device" | "en" | "he" | "ru" | "ar" | "es";

export default function LanguageScreen() {
  const s = useStrings();
  const router = useRouter();
  const locale = useAppStore((st) => st.locale);
  const setLocale = useAppStore((st) => st.setLocale);
  const backIcon = I18nManager.isRTL ? "chevron-right" : "chevron-left";

  const langs: { key: LangKey; label: string; ready: boolean }[] = [
    { key: "device", label: s.device, ready: true },
    { key: "en", label: s.english, ready: true },
    { key: "he", label: s.hebrew, ready: true },
    { key: "ru", label: s.russian, ready: false },
    { key: "ar", label: s.arabic, ready: false },
    { key: "es", label: s.spanish, ready: false },
  ];

  const onPick = (l: { key: LangKey; ready: boolean }) => {
    if (!l.ready) {
      Alert.alert(s.language, s.comingSoon);
      return;
    }
    setLocale(l.key as "device" | "en" | "he");
    router.back();
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: green.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name={backIcon} size={26} color={green.text} />
        </Pressable>
        <Text style={styles.title}>{s.language}</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}>
        <View style={styles.list}>
          {langs.map((l) => {
            const selected = l.ready && locale === l.key;
            return (
              <Pressable key={l.key} style={styles.row} onPress={() => onPick(l)}>
                <Text style={[styles.rowLabel, !l.ready && styles.rowLabelMuted]}>{l.label}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { color: green.text, fontSize: 20, fontFamily: fonts.bold, textAlign: textStart },
  list: {
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
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: green.border,
  },
  rowLabel: { color: green.text, fontSize: 16, fontFamily: fonts.semibold, textAlign: textStart },
  rowLabelMuted: { color: green.textDim },
  soon: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular },
});
