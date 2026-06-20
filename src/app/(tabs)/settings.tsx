/**
 * Settings — rebuilt to the "haze" handoff: a reduction-plan banner (Old habit →
 * Today's limit, big mono numbers) and −/+ stepper rows for the plan + pricing.
 * The value in each stepper is still tappable to open the in-app number pad for
 * direct entry. Language stays a real switcher (Device / English / עברית),
 * rendered as chips. Account/sign-out kept from before.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode, useRef } from "react";
import { Alert, I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { currentLimit } from "@/domain/logic";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { signOut } from "@/lib/googleAuth";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing, type } from "@/theme";
import { NumberPad, NumberPadRef } from "../../../packages/number-pad";

export default function SettingsScreen() {
  const s = useStrings();
  const { limits, settings, locale } = useAppStore();
  const dataMode = useAppStore((st) => st.dataMode);
  const setDataMode = useAppStore((st) => st.setDataMode);
  const setLimit = useAppStore((st) => st.setLimit);
  const saveSettings = useAppStore((st) => st.saveSettings);
  const setLocale = useAppStore((st) => st.setLocale);
  const pad = useRef<NumberPadRef>(null);

  const cur = settings.currencySymbol;
  const limit = currentLimit(limits, settings);
  const priceText = `${cur}${Number.isInteger(settings.pricePerPack) ? settings.pricePerPack.toFixed(0) : settings.pricePerPack.toFixed(2)}`;
  const planArrow = I18nManager.isRTL ? "arrow-back" : "arrow-forward";

  const langs: { key: "device" | "en" | "he"; label: string }[] = [
    { key: "device", label: s.device },
    { key: "en", label: s.english },
    { key: "he", label: s.hebrew },
  ];

  const confirmLang = (l: { key: "device" | "en" | "he"; label: string }) =>
    Alert.alert(
      s.language,
      `${locale === "he" ? "האם אתה בטוח שברצונך לשנות שפה ל-" : "Are you sure you want to change the language to "}${l.label}?`,
      [
        { text: s.cancel, style: "cancel" },
        { text: locale === "he" ? "כן" : "Yes", onPress: () => setLocale(l.key) },
      ],
    );

  const confirmSignOut = () =>
    Alert.alert(s.signOutTitle, s.signOutBody, [
      { text: s.cancel, style: "cancel" },
      {
        text: s.signOut,
        style: "destructive",
        onPress: async () => {
          await signOut();
          await setDataMode(null);
        },
      },
    ]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: spacing.md, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}
        alwaysBounceVertical
        overScrollMode="always"
      >
        <Text style={styles.title}>{s.settings}</Text>

        {/* Reduction plan banner */}
        <Text style={styles.groupTitle}>{s.reductionPlan}</Text>
        <View style={styles.plan}>
          <View style={styles.planSide}>
            <Text style={styles.planLabel}>{s.oldHabit}</Text>
            <Text style={styles.planValueDim}>{settings.baselinePerDay}</Text>
          </View>
          <MaterialIcons name={planArrow} size={22} color={colors.accent} />
          <View style={styles.planSide}>
            <Text style={styles.planLabel}>{s.todaysLimitShort}</Text>
            <Text style={styles.planValue}>{limit}</Text>
          </View>
        </View>

        {/* Daily goal — steppers */}
        <Group title={s.dailyGoal}>
          <StepperRow
            label={s.baseline}
            hint={s.baselineHelper}
            value={settings.baselinePerDay}
            display={`${settings.baselinePerDay}`}
            min={1}
            max={60}
            onChange={(v) => saveSettings({ ...settings, baselinePerDay: v })}
            onPressValue={() =>
              pad.current?.present({
                title: s.baseline,
                initial: settings.baselinePerDay,
                onSubmit: (v) => saveSettings({ ...settings, baselinePerDay: Math.round(v) }),
              })
            }
          />
          <Divider />
          <StepperRow
            label={s.maxPerDay}
            hint={s.appliesFromToday}
            value={limit}
            display={`${limit}`}
            min={1}
            max={40}
            onChange={(v) => setLimit(v)}
            onPressValue={() =>
              pad.current?.present({ title: s.maxPerDay, initial: limit, onSubmit: (v) => setLimit(Math.round(v)) })
            }
          />
          <Divider />
          <StepperRow
            label={s.dayStart}
            hint={s.dayStartHelper}
            value={settings.dayStartHour}
            display={`${String(settings.dayStartHour).padStart(2, "0")}:00`}
            min={0}
            max={23}
            onChange={(v) => saveSettings({ ...settings, dayStartHour: v })}
            onPressValue={() =>
              pad.current?.present({
                title: s.dayStart,
                initial: settings.dayStartHour,
                onSubmit: (v) => saveSettings({ ...settings, dayStartHour: Math.min(23, Math.max(0, Math.round(v))) }),
              })
            }
          />
        </Group>

        {/* Pricing */}
        <Group title={s.pricing}>
          <StepperRow
            label={s.pricePerPack(cur)}
            value={settings.pricePerPack}
            display={priceText}
            min={1}
            max={40}
            step={0.5}
            onChange={(v) => saveSettings({ ...settings, pricePerPack: v })}
            onPressValue={() =>
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
                    <Text style={{ color: sel ? colors.onAccent : colors.textDim, fontFamily: fonts.bold }}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Group>

        {/* Language — chips */}
        <Group title={s.language}>
          <View style={styles.chipRow}>
            {langs.map((l) => {
              const sel = locale === l.key;
              return (
                <Pressable
                  key={l.key}
                  style={[styles.langChip, sel && styles.langChipSel]}
                  onPress={() => !sel && confirmLang(l)}
                >
                  <Text style={[styles.langChipText, sel && styles.langChipTextSel]}>{l.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Group>

        {dataMode === "supabase" ? (
          <Pressable style={styles.signOut} onPress={confirmSignOut}>
            <MaterialIcons name="logout" size={18} color={colors.bad} />
            <Text style={styles.signOutText}>{s.signOut}</Text>
          </Pressable>
        ) : (
          <Group title={s.account}>
            <Text style={styles.localNote}>{s.localDataNote}</Text>
            <Pressable style={styles.switchBtn} onPress={() => setDataMode(null)}>
              <MaterialIcons name="login" size={18} color={colors.accent} />
              <Text style={styles.switchText}>{s.signInToAccount}</Text>
            </Pressable>
          </Group>
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
      <View>{children}</View>
    </View>
  );
}

function StepperRow({
  label,
  hint,
  value,
  display,
  min,
  max,
  step = 1,
  onChange,
  onPressValue,
}: {
  label: string;
  hint?: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onPressValue: () => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <View style={styles.stepper}>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value - step))} hitSlop={6}>
          <MaterialIcons name="remove" size={18} color={colors.text} />
        </Pressable>
        <Pressable onPress={onPressValue} hitSlop={6}>
          <Text style={styles.stepValue}>{display}</Text>
        </Pressable>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value + step))} hitSlop={6}>
          <MaterialIcons name="add" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontFamily: fonts.bold, marginBottom: spacing.xl, textAlign: textStart },
  groupTitle: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: fonts.medium,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginStart: spacing.md,
    textAlign: textStart,
  },

  plan: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  planSide: { alignItems: "center", flex: 1 },
  planLabel: { color: colors.textDim, fontSize: 12, fontFamily: fonts.regular, marginBottom: 4 },
  planValue: { color: colors.accent, fontSize: 26, fontFamily: fonts.monoMedium },
  planValueDim: { color: colors.textDim, fontSize: 26, fontFamily: fonts.monoMedium },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
  rowLabel: { color: colors.text, fontSize: type.body.fontSize, fontFamily: fonts.regular, textAlign: textStart },
  rowHint: { color: colors.textFaint, fontSize: 11, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },
  divider: { height: 1, backgroundColor: colors.line },

  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: { color: colors.text, fontSize: 16, fontFamily: fonts.monoMedium, minWidth: 44, textAlign: "center" },

  segmentRow: { flexDirection: "row", gap: spacing.sm },
  curSeg: { paddingHorizontal: spacing.lg, paddingVertical: 6, borderRadius: 12, minWidth: 44, alignItems: "center" },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  langChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  langChipSel: { backgroundColor: colors.accentSoft, borderColor: colors.accentBorderStrong },
  langChipText: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.medium },
  langChipTextSel: { color: colors.accentText },

  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  signOutText: { color: colors.bad, fontFamily: fonts.semibold },
  localNote: { color: colors.textDim, fontSize: 13, fontFamily: fonts.regular, paddingVertical: spacing.sm, textAlign: textStart },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  switchText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 15 },
});
