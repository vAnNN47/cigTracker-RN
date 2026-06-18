/**
 * Settings screen — ported from lib/screens/settings_screen.dart.
 * Language (Device/EN/עברית), Daily goal (max/day, baseline, day-start) and
 * Pricing (price-per-pack, currency) — numeric fields use the in-app number pad
 * (packages/number-pad). Sign-out appears once auth is wired (Step 5); until
 * then a demo note is shown.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { currentLimit } from "@/domain/logic";
import { useStrings } from "@/i18n/useStrings";
import { USE_SUPABASE } from "@/lib/config";
import { signOut } from "@/lib/googleAuth";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, type } from "@/theme";
import { NumberPad, NumberPadRef } from "../../../packages/number-pad";

export default function SettingsScreen() {
  const s = useStrings();
  const { limits, settings, locale } = useAppStore();
  const setLimit = useAppStore((st) => st.setLimit);
  const saveSettings = useAppStore((st) => st.saveSettings);
  const setLocale = useAppStore((st) => st.setLocale);
  const pad = useRef<NumberPadRef>(null);
  const [langOpen, setLangOpen] = useState(false);

  const cur = settings.currencySymbol;
  const limit = currentLimit(limits, settings);
  const priceText = `${cur}${Number.isInteger(settings.pricePerPack) ? settings.pricePerPack.toFixed(0) : settings.pricePerPack.toFixed(2)}`;

  const langs: { key: "device" | "en" | "he"; label: string }[] = [
    { key: "device", label: s.device },
    { key: "en", label: s.english },
    { key: "he", label: s.hebrew },
  ];
  const currentLangLabel = langs.find((l) => l.key === locale)?.label ?? s.device;
  const otherLangs = langs.filter((l) => l.key !== locale);

  const confirmSignOut = () =>
    Alert.alert(s.signOutTitle, s.signOutBody, [
      { text: s.cancel, style: "cancel" },
      { text: s.signOut, style: "destructive", onPress: signOut },
    ]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: spacing.md, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}
        alwaysBounceVertical
        overScrollMode="always"
      >
        <Text style={styles.title}>{s.settings}</Text>

        {/* Language (dropdown) */}
        <Group title={s.language}>
          <Pressable style={styles.row} onPress={() => setLangOpen((v) => !v)}>
            <Text style={[styles.rowLabel, { flex: 1 }]}>{currentLangLabel}</Text>
            <MaterialIcons name={langOpen ? "expand-less" : "expand-more"} size={22} color={colors.textDim} />
          </Pressable>
          {langOpen &&
            otherLangs.map((l) => (
              <View key={l.key}>
                <Divider />
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    const nextLabel = l.label;
                    Alert.alert(
                      s.language,
                      `${locale === "he" ? "האם אתה בטוח שברצונך לשנות שפה ל-" : "Are you sure you want to change the language to "}${nextLabel}?`,
                      [
                        { text: s.cancel, style: "cancel" },
                        {
                          text: locale === "he" ? "כן" : "Yes",
                          onPress: () => {
                            setLocale(l.key);
                            setLangOpen(false);
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Text style={[styles.rowLabel, { flex: 1 }]}>{l.label}</Text>
                </Pressable>
              </View>
            ))}
        </Group>

        {/* Daily goal */}
        <Group title={s.dailyGoal}>
          <EditableRow
            label={s.maxPerDay}
            value={`${limit}`}
            helper={s.appliesFromToday}
            onPress={() =>
              pad.current?.present({
                title: s.maxPerDay,
                initial: limit,
                onSubmit: (v) => setLimit(Math.round(v)),
              })
            }
          />
          <Divider />
          <EditableRow
            label={s.baseline}
            value={`${settings.baselinePerDay}`}
            helper={s.baselineHelper}
            onPress={() =>
              pad.current?.present({
                title: s.baseline,
                initial: settings.baselinePerDay,
                onSubmit: (v) => saveSettings({ ...settings, baselinePerDay: Math.round(v) }),
              })
            }
          />
          <Divider />
          <EditableRow
            label={s.dayStart}
            value={`${String(settings.dayStartHour).padStart(2, "0")}:00`}
            helper={s.dayStartHelper}
            onPress={() =>
              pad.current?.present({
                title: s.dayStart,
                initial: settings.dayStartHour,
                onSubmit: (v) =>
                  saveSettings({ ...settings, dayStartHour: Math.min(23, Math.max(0, Math.round(v))) }),
              })
            }
          />
        </Group>

        {/* Pricing */}
        <Group title={s.pricing}>
          <EditableRow
            label={s.pricePerPack(cur)}
            value={priceText}
            onPress={() =>
              pad.current?.present({
                title: s.pricePerPack(cur),
                initial: settings.pricePerPack,
                decimal: true,
                prefix: `${cur} `,
                onSubmit: (v) => saveSettings({ ...settings, pricePerPack: v }),
              })
            }
          />
          <Divider />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { flex: 1 }]}>{s.currency}</Text>
            <View style={styles.segmentRow}>
              {["₪", "$"].map((c) => {
                const sel = cur === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => saveSettings({ ...settings, currencySymbol: c })}
                    style={[styles.curSeg, { backgroundColor: sel ? colors.accent : colors.surfaceHigh }]}
                  >
                    <Text style={{ color: sel ? colors.onAccent : colors.textDim, fontWeight: "700" }}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Group>

        {USE_SUPABASE ? (
          <Pressable style={styles.signOut} onPress={confirmSignOut}>
            <MaterialIcons name="logout" size={18} color={colors.bad} />
            <Text style={styles.signOutText}>{s.signOut}</Text>
          </Pressable>
        ) : (
          <Text style={styles.demo}>{s.demoNote}</Text>
        )}
      </ScrollView>

      <NumberPad
        ref={pad}
        surface={colors.surface}
        surfaceHigh={colors.surfaceHigh}
        text={colors.text}
        textDim={colors.textDim}
        accent={colors.accent}
        onAccent={colors.onAccent}
        cornerRadius={radius.sheet}
        cancelLabel={s.cancel}
        saveLabel={s.save}
      />
    </SafeAreaView>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupBox}>{children}</View>
    </View>
  );
}

function EditableRow({
  label,
  value,
  helper,
  onPress,
}: {
  label: string;
  value: string;
  helper?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {helper ? <Text style={styles.rowHelper}>{helper}</Text> : null}
      </View>
      <Text style={styles.rowValue}>{value}</Text>
      <MaterialIcons name="edit" size={16} color={colors.textDim} style={{ marginLeft: spacing.sm }} />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: spacing.xl },
  groupTitle: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  groupBox: { backgroundColor: "transparent", borderRadius: 0, paddingHorizontal: 0 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
  rowLabel: { color: colors.text, fontSize: type.body.fontSize },
  rowHelper: { color: colors.textDim, fontSize: 11, marginTop: 2 },
  rowValue: { color: colors.text, fontSize: 16, fontWeight: "700" },
  divider: { height: 1, backgroundColor: colors.line },
  segmentRow: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.sm },
  segment: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 14 },
  curSeg: { paddingHorizontal: spacing.lg, paddingVertical: 6, borderRadius: 12, minWidth: 44, alignItems: "center" },
  demo: { color: colors.textDim, fontSize: 12, marginHorizontal: spacing.xs },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  signOutText: { color: colors.bad, fontWeight: "600" },
});

