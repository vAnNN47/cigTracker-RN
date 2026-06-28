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
import { Alert, I18nManager, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { currentLimit } from "@/domain/logic";
import { resolveLang, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { signOut } from "@/lib/googleAuth";
import { AppSettings } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { radius, useColors } from "@/theme";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { NumberPad, NumberPadRef } from "../../packages/number-pad";

const COMMIT_MS = 400;

/**
 * Settings body. Rendered both as the /settings route AND as a panel inside the
 * account drawer, so it takes an `onClose` instead of calling router.back —
 * that lets it slide from the drawer's own edge (deterministically the right
 * side per language) rather than relying on the native-stack push direction.
 */
export function SettingsView({ onClose }: { onClose: () => void }) {
  const s = useStrings();
  const green = useColors();
  const backIcon = I18nManager.isRTL ? "chevron-right" : "chevron-left";
  const { limits, settings, locale } = useAppStore(
    useShallow((st) => ({ limits: st.limits, settings: st.settings, locale: st.locale })),
  );
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
  const limitRef = useRef(limitDraft);
  const settingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mirror the latest drafts into refs (from an effect, not during render) so the
  // unmount flush below persists the current values.
  useEffect(() => {
    formRef.current = form;
    limitRef.current = limitDraft;
  }, [form, limitDraft]);

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
      <View className="flex-row items-center gap-2 px-4 py-2">
        <Pressable onPress={onClose} hitSlop={10} className="w-8 h-8 items-center justify-center" accessibilityRole="button" accessibilityLabel={s.a11yBack}>
          <MaterialIcons name={backIcon} size={26} color={green.text} />
        </Pressable>
        <Text className="text-text text-[20px] font-bold" style={{ textAlign: textStart }}>{s.settings}</Text>
      </View>
      <ScrollView
        contentContainerClassName="pt-2 px-5 pb-6"
        alwaysBounceVertical
        overScrollMode="always"
      >

        {/* Reduction plan banner */}
        <Text className="text-text-dim text-[12px] font-medium uppercase tracking-[1.2px] mb-2 ms-3" style={{ textAlign: textStart }}>{s.reductionPlan}</Text>
        <View className="flex-row items-center justify-between py-4 mb-5 border-t border-b border-border">
          <View className="items-center flex-1">
            <Text className="text-text-dim text-[12px] font-regular mb-1">{s.oldHabit}</Text>
            <Text className="text-text-dim text-[26px] font-mono-medium">{form.baselinePerDay}</Text>
          </View>
          <MaterialIcons name={planArrow} size={22} color={green.green} />
          <View className="items-center flex-1">
            <Text className="text-text-dim text-[12px] font-regular mb-1">{s.todaysLimitShort}</Text>
            <Text className="text-green text-[26px] font-mono-medium">{limitDraft}</Text>
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
          <View className="flex-row items-center py-3">
            <View className="flex-1">
              <Text className="text-text text-[14px] font-regular" style={{ textAlign: textStart }}>{s.countDown}</Text>
              <Text className="text-text-dim text-[11px] font-regular mt-0.5" style={{ textAlign: textStart }}>{s.countDownHint}</Text>
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
          <View className="flex-row items-center py-3">
            <Text className="text-text text-[14px] font-regular flex-1" style={{ textAlign: textStart }}>{s.currency}</Text>
            <View className="flex-row gap-2">
              {["₪", "$"].map((c) => {
                const sel = cur === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => commitSettings({ ...form, currencySymbol: c }, true)}
                    className={`px-4 py-1.5 rounded-chip min-w-[44px] items-center ${sel ? "bg-green" : "bg-card-soft"}`}
                  >
                    <Text className={`${sel ? "text-on-green" : "text-text-dim"} font-bold`}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Group>

        {/* Language — dropdown; selected sits on top, highlighted */}
        <Group title={s.language}>
          <Pressable className="flex-row items-center py-3" onPress={() => setLangOpen((v) => !v)}>
            <Text className="text-green text-[14px] font-bold flex-1" style={{ textAlign: textStart }}>{currentLangLabel}</Text>
            <MaterialIcons name="check" size={18} color={green.green} />
            <MaterialIcons name={langOpen ? "expand-less" : "expand-more"} size={22} color={green.textDim} />
          </Pressable>
          {langOpen &&
            otherLangs.map((l) => (
              <View key={l.key}>
                <Divider />
                <Pressable
                  className="flex-row items-center py-3"
                  onPress={() => {
                    setLangOpen(false);
                    confirmLang(l);
                  }}
                >
                  <Text className="text-text text-[14px] font-regular flex-1" style={{ textAlign: textStart }}>{l.label}</Text>
                </Pressable>
              </View>
            ))}
        </Group>

        {dataMode === "supabase" ? (
          <Pressable className="flex-row items-center justify-center gap-2 py-4 border-t border-border" onPress={confirmSignOut}>
            <MaterialIcons name="logout" size={18} color={green.error} />
            <Text className="text-error font-semibold">{s.signOut}</Text>
          </Pressable>
        ) : (
          <Group title={s.account}>
            <Text className="text-text-dim text-[13px] font-regular py-2" style={{ textAlign: textStart }}>{s.localDataNote}</Text>
            <Pressable className="flex-row items-center gap-2 py-3 border-t border-border" onPress={() => setDataMode(null)}>
              <MaterialIcons name="login" size={18} color={green.green} />
              <Text className="text-green font-bold text-[15px]">{s.signInToAccount}</Text>
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
  return (
    <View className="mb-4">
      <Text className="text-text-dim text-[12px] font-medium uppercase tracking-[1.2px] mb-2 ms-3" style={{ textAlign: textStart }}>{title}</Text>
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
  const s = useStrings();
  const green = useColors();
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return (
    <View className="flex-row items-center py-3">
      <View className="flex-1">
        <Text className="text-text text-[14px] font-regular" style={{ textAlign: textStart }}>{label}</Text>
        {hint ? <Text className="text-text-dim text-[11px] font-regular mt-0.5" style={{ textAlign: textStart }}>{hint}</Text> : null}
      </View>
      <View className="flex-row items-center gap-3">
        <Pressable className="w-[34px] h-[34px] rounded-[10px] border border-border items-center justify-center" onPress={() => onChange(clamp(value - step))} hitSlop={6} accessibilityRole="button" accessibilityLabel={s.a11yDecrease(label)}>
          <MaterialIcons name="remove" size={18} color={green.text} />
        </Pressable>
        <Pressable onPress={onPressValue} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${label}, ${display}`}>
          <Text className="text-text text-[16px] font-mono-medium min-w-[44px] text-center">{display}</Text>
        </Pressable>
        <Pressable className="w-[34px] h-[34px] rounded-[10px] border border-border items-center justify-center" onPress={() => onChange(clamp(value + step))} hitSlop={6} accessibilityRole="button" accessibilityLabel={s.a11yIncrease(label)}>
          <MaterialIcons name="add" size={18} color={green.text} />
        </Pressable>
      </View>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-border" />;
}

/** /settings route — kept so deep links still work; closes by popping. */
export default function SettingsScreen() {
  const router = useRouter();
  return <SettingsView onClose={() => router.back()} />;
}
