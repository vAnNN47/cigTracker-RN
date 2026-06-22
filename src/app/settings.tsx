/**
 * Settings — v2 light/green theme. Reduction-plan banner (Old habit → Today's
 * limit) + −/+ stepper rows (value also opens the in-app number pad). Stepper
 * writes are DEBOUNCED (instant draft state, persist after a short idle) so the
 * buttons don't lag; pending writes flush on unmount. Language is a dropdown
 * switcher (Device / English / עברית).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Alert, I18nManager, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { currentLimit } from "@/domain/logic";
import { resolveLang, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { signOut } from "@/lib/googleAuth";
import { AppSettings } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { fonts, makeUseStyles, radius, spacing, type, useColors } from "@/theme";
import { NumberPad, NumberPadRef } from "../../packages/number-pad";

const COMMIT_MS = 400;
const BAD = "#C0392B";

/**
 * Settings body. Rendered both as the /settings route AND as a panel inside the
 * account drawer, so it takes an `onClose` instead of calling router.back —
 * that lets it slide from the drawer's own edge (deterministically the right
 * side per language) rather than relying on the native-stack push direction.
 */
export function SettingsView({ onClose }: { onClose: () => void }) {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
  const backIcon = I18nManager.isRTL ? "chevron-right" : "chevron-left";
  const { limits, settings, locale } = useAppStore();
  const dataMode = useAppStore((st) => st.dataMode);
  const setDataMode = useAppStore((st) => st.setDataMode);
  const setLimit = useAppStore((st) => st.setLimit);
  const saveSettings = useAppStore((st) => st.saveSettings);
  const setLocale = useAppStore((st) => st.setLocale);
  const pad = useRef<NumberPadRef>(null);

  // Local drafts — the UI reads these so steps are instant; persistence is debounced.
  const [form, setForm] = useState<AppSettings>(settings);
  const [limitDraft, setLimitDraft] = useState(() => currentLimit(limits, settings));
  const [langOpen, setLangOpen] = useState(false);

  const formRef = useRef(form);
  formRef.current = form;
  const limitRef = useRef(limitDraft);
  limitRef.current = limitDraft;
  const settingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flush any pending write when leaving the screen so nothing is lost.
  useEffect(
    () => () => {
      if (settingsTimer.current) saveSettings(formRef.current);
      if (limitTimer.current) setLimit(limitRef.current);
    },
    [saveSettings, setLimit],
  );

  const commitSettings = (next: AppSettings, now = false) => {
    setForm(next);
    if (settingsTimer.current) clearTimeout(settingsTimer.current);
    if (now) {
      settingsTimer.current = null;
      saveSettings(next);
    } else {
      settingsTimer.current = setTimeout(() => {
        settingsTimer.current = null;
        saveSettings(next);
      }, COMMIT_MS);
    }
  };

  const commitLimit = (v: number, now = false) => {
    setLimitDraft(v);
    if (limitTimer.current) clearTimeout(limitTimer.current);
    if (now) {
      limitTimer.current = null;
      setLimit(v);
    } else {
      limitTimer.current = setTimeout(() => {
        limitTimer.current = null;
        setLimit(v);
      }, COMMIT_MS);
    }
  };

  const cur = form.currencySymbol;
  const priceText = `${cur}${Number.isInteger(form.pricePerPack) ? form.pricePerPack.toFixed(0) : form.pricePerPack.toFixed(2)}`;
  const planArrow = I18nManager.isRTL ? "arrow-back" : "arrow-forward";

  // No "Device" option — language follows the device until the user explicitly
  // picks one; the chosen (effective) language is shown on top, highlighted.
  const langs: { key: "en" | "he"; label: string }[] = [
    { key: "en", label: s.english },
    { key: "he", label: s.hebrew },
  ];
  const effectiveLang = locale === "device" ? resolveLang("device") : locale;
  const currentLangLabel = langs.find((l) => l.key === effectiveLang)?.label ?? s.english;
  const otherLangs = langs.filter((l) => l.key !== effectiveLang);

  const confirmLang = (l: { key: "en" | "he"; label: string }) =>
    Alert.alert(
      s.language,
      `${s.he ? "האם אתה בטוח שברצונך לשנות שפה ל-" : "Are you sure you want to change the language to "}${l.label}?`,
      [
        { text: s.cancel, style: "cancel" },
        { text: s.he ? "כן" : "Yes", onPress: () => setLocale(l.key) },
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
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: green.bg }}>
      <View style={styles.topBar}>
        <Pressable onPress={onClose} hitSlop={10} style={styles.backBtn}>
          <MaterialIcons name={backIcon} size={26} color={green.text} />
        </Pressable>
        <Text style={styles.topTitle}>{s.settings}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingTop: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}
        alwaysBounceVertical
        overScrollMode="always"
      >

        {/* Reduction plan banner */}
        <Text style={styles.groupTitle}>{s.reductionPlan}</Text>
        <View style={styles.plan}>
          <View style={styles.planSide}>
            <Text style={styles.planLabel}>{s.oldHabit}</Text>
            <Text style={styles.planValueDim}>{form.baselinePerDay}</Text>
          </View>
          <MaterialIcons name={planArrow} size={22} color={green.green} />
          <View style={styles.planSide}>
            <Text style={styles.planLabel}>{s.todaysLimitShort}</Text>
            <Text style={styles.planValue}>{limitDraft}</Text>
          </View>
        </View>

        {/* Daily goal — steppers */}
        <Group title={s.dailyGoal}>
          <StepperRow
            label={s.baseline}
            hint={s.baselineHelper}
            value={form.baselinePerDay}
            display={`${form.baselinePerDay}`}
            min={1}
            max={60}
            onChange={(v) => commitSettings({ ...form, baselinePerDay: v })}
            onPressValue={() =>
              pad.current?.present({
                title: s.baseline,
                initial: form.baselinePerDay,
                onSubmit: (v) => commitSettings({ ...form, baselinePerDay: Math.round(v) }, true),
              })
            }
          />
          <Divider />
          <StepperRow
            label={s.maxPerDay}
            hint={s.appliesFromToday}
            value={limitDraft}
            display={`${limitDraft}`}
            min={1}
            max={40}
            onChange={(v) => commitLimit(v)}
            onPressValue={() =>
              pad.current?.present({
                title: s.maxPerDay,
                initial: limitDraft,
                onSubmit: (v) => commitLimit(Math.round(v), true),
              })
            }
          />
          <Divider />
          <StepperRow
            label={s.dayStart}
            hint={s.dayStartHelper}
            value={form.dayStartHour}
            display={`${String(form.dayStartHour).padStart(2, "0")}:00`}
            min={0}
            max={23}
            onChange={(v) => commitSettings({ ...form, dayStartHour: v })}
            onPressValue={() =>
              pad.current?.present({
                title: s.dayStart,
                initial: form.dayStartHour,
                onSubmit: (v) =>
                  commitSettings({ ...form, dayStartHour: Math.min(23, Math.max(0, Math.round(v))) }, true),
              })
            }
          />
          <Divider />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{s.countDown}</Text>
              <Text style={styles.rowHint}>{s.countDownHint}</Text>
            </View>
            <Switch
              value={form.countDown}
              onValueChange={(v) => commitSettings({ ...form, countDown: v }, true)}
              trackColor={{ true: green.greenBright, false: green.border }}
              thumbColor={green.card}
            />
          </View>
        </Group>

        {/* Pricing */}
        <Group title={s.pricing}>
          <StepperRow
            label={s.pricePerPack(cur)}
            value={form.pricePerPack}
            display={priceText}
            min={1}
            max={40}
            step={0.5}
            onChange={(v) => commitSettings({ ...form, pricePerPack: v })}
            onPressValue={() =>
              pad.current?.present({
                title: s.pricePerPack(cur),
                initial: form.pricePerPack,
                decimal: true,
                prefix: `${cur} `,
                onSubmit: (v) => commitSettings({ ...form, pricePerPack: v }, true),
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
                    onPress={() => commitSettings({ ...form, currencySymbol: c }, true)}
                    style={[styles.curSeg, { backgroundColor: sel ? green.green : green.cardSoft }]}
                  >
                    <Text style={{ color: sel ? green.onGreen : green.textDim, fontFamily: fonts.bold }}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Group>

        {/* Language — dropdown; selected sits on top, highlighted */}
        <Group title={s.language}>
          <Pressable style={styles.row} onPress={() => setLangOpen((v) => !v)}>
            <Text style={[styles.langCurrent, { flex: 1 }]}>{currentLangLabel}</Text>
            <MaterialIcons name="check" size={18} color={green.green} />
            <MaterialIcons name={langOpen ? "expand-less" : "expand-more"} size={22} color={green.textDim} />
          </Pressable>
          {langOpen &&
            otherLangs.map((l) => (
              <View key={l.key}>
                <Divider />
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    setLangOpen(false);
                    confirmLang(l);
                  }}
                >
                  <Text style={[styles.rowLabel, { flex: 1 }]}>{l.label}</Text>
                </Pressable>
              </View>
            ))}
        </Group>

        {dataMode === "supabase" ? (
          <Pressable style={styles.signOut} onPress={confirmSignOut}>
            <MaterialIcons name="logout" size={18} color={BAD} />
            <Text style={styles.signOutText}>{s.signOut}</Text>
          </Pressable>
        ) : (
          <Group title={s.account}>
            <Text style={styles.localNote}>{s.localDataNote}</Text>
            <Pressable style={styles.switchBtn} onPress={() => setDataMode(null)}>
              <MaterialIcons name="login" size={18} color={green.green} />
              <Text style={styles.switchText}>{s.signInToAccount}</Text>
            </Pressable>
          </Group>
        )}
      </ScrollView>

      <NumberPad
        ref={pad}
        surface={green.card}
        surfaceHigh={green.cardSoft}
        text={green.text}
        textDim={green.textDim}
        accent={green.green}
        onAccent={green.onGreen}
        cornerRadius={radius.sheet}
        cancelLabel={s.cancel}
        saveLabel={s.save}
      />
    </SafeAreaView>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
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
  const green = useColors();
  const styles = useStyles();
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <View style={styles.stepper}>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value - step))} hitSlop={6}>
          <MaterialIcons name="remove" size={18} color={green.text} />
        </Pressable>
        <Pressable onPress={onPressValue} hitSlop={6}>
          <Text style={styles.stepValue}>{display}</Text>
        </Pressable>
        <Pressable style={styles.stepBtn} onPress={() => onChange(clamp(value + step))} hitSlop={6}>
          <MaterialIcons name="add" size={18} color={green.text} />
        </Pressable>
      </View>
    </View>
  );
}

function Divider() {
  const styles = useStyles();
  return <View style={styles.divider} />;
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  topTitle: { color: green.text, fontSize: 20, fontFamily: fonts.bold, textAlign: textStart },
  title: { color: green.text, fontSize: 22, fontFamily: fonts.bold, marginBottom: spacing.xl, textAlign: textStart },
  groupTitle: {
    color: green.textDim,
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
    borderColor: green.border,
  },
  planSide: { alignItems: "center", flex: 1 },
  planLabel: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular, marginBottom: 4 },
  planValue: { color: green.green, fontSize: 26, fontFamily: fonts.monoMedium },
  planValueDim: { color: green.textDim, fontSize: 26, fontFamily: fonts.monoMedium },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md },
  rowLabel: { color: green.text, fontSize: type.body.fontSize, fontFamily: fonts.regular, textAlign: textStart },
  rowHint: { color: green.textDim, fontSize: 11, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },
  divider: { height: 1, backgroundColor: green.border },

  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: green.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: { color: green.text, fontSize: 16, fontFamily: fonts.monoMedium, minWidth: 44, textAlign: "center" },

  segmentRow: { flexDirection: "row", gap: spacing.sm },
  curSeg: { paddingHorizontal: spacing.lg, paddingVertical: 6, borderRadius: 12, minWidth: 44, alignItems: "center" },

  langCurrent: { color: green.green, fontSize: type.body.fontSize, fontFamily: fonts.bold, textAlign: textStart },

  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: green.border,
  },
  signOutText: { color: BAD, fontFamily: fonts.semibold },
  localNote: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, paddingVertical: spacing.sm, textAlign: textStart },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: green.border,
  },
  switchText: { color: green.green, fontFamily: fonts.bold, fontSize: 15 },
  }),
);

/** /settings route — kept so deep links still work; closes by popping. */
export default function SettingsScreen() {
  const router = useRouter();
  return <SettingsView onClose={() => router.back()} />;
}
