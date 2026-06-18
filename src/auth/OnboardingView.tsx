/**
 * Onboarding — ported from lib/screens/onboarding_screen.dart. Captures baseline
 * + daily limit on first run (numeric entry via the number-pad package), then
 * saves settings + the first daily limit and calls onDone.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, type } from "@/theme";
import { NumberPad, NumberPadRef } from "../../packages/number-pad";

export function OnboardingView({ onDone }: { onDone: () => void }) {
  const s = useStrings();
  const settings = useAppStore((st) => st.settings);
  const saveSettings = useAppStore((st) => st.saveSettings);
  const setLimit = useAppStore((st) => st.setLimit);
  const pad = useRef<NumberPadRef>(null);

  const [baseline, setBaseline] = useState(settings.baselinePerDay || 20);
  const [target, setTarget] = useState(15);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      await saveSettings({ ...settings, baselinePerDay: baseline });
      await setLimit(target);
      onDone();
    } catch {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logo}>
          <MaterialIcons name="insights" size={32} color={colors.accent} />
        </View>
        <Text style={styles.title}>{s.welcomeTitle}</Text>
        <Text style={styles.intro}>{s.onboardingIntro}</Text>

        <PickRow
          label={s.onboardBaselineQ}
          value={baseline}
          onPress={() =>
            pad.current?.present({ title: s.onboardBaselineQ, initial: baseline, onSubmit: (v) => setBaseline(Math.round(v)) })
          }
        />
        <PickRow
          label={s.onboardTargetQ}
          value={target}
          onPress={() =>
            pad.current?.present({ title: s.onboardTargetQ, initial: target, onSubmit: (v) => setTarget(Math.round(v)) })
          }
        />

        <Pressable style={[styles.btn, saving && styles.btnDisabled]} onPress={finish} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.onAccent} /> : <Text style={styles.btnText}>{s.startTracking}</Text>}
        </Pressable>
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

function PickRow({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.pickLabel}>{label}</Text>
      <Pressable style={styles.pickBox} onPress={onPress}>
        <Text style={styles.pickValue}>{value}</Text>
        <MaterialIcons name="edit" size={18} color={colors.textDim} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, justifyContent: "center", padding: spacing.xxl, maxWidth: 420, alignSelf: "center", width: "100%" },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.text, fontSize: 24, fontWeight: "700", marginTop: spacing.xl },
  intro: { color: colors.textDim, marginTop: spacing.sm },
  pickLabel: { color: colors.text, fontWeight: "600", marginBottom: spacing.sm },
  pickBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.input,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  pickValue: { color: colors.text, fontSize: 20, fontWeight: "700" },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.onAccent, fontWeight: "600", fontSize: type.body.fontSize },
});
