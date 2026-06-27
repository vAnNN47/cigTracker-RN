/**
 * Onboarding. Captures baseline + daily limit on first run (numeric entry via
 * the number-pad package), then saves settings + the first daily limit and
 * calls onDone.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { radius, useColors } from "@/theme";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { NumberPad, NumberPadRef } from "../../packages/number-pad";

/** First-run setup: capture baseline + daily limit, then save and call onDone. */
export function OnboardingView({ onDone }: { onDone: () => void }) {
  const s = useStrings();
  const green = useColors();
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
    <SafeAreaView style={{ flex: 1, backgroundColor: green.bg }}>
      <ScrollView contentContainerClassName="grow justify-center p-6 max-w-[420px] self-center w-full">
        <View className="w-16 h-16 rounded-[20px] bg-card-soft items-center justify-center">
          <MaterialIcons name="insights" size={32} color={green.green} />
        </View>
        <Text className="text-green text-[24px] font-bold mt-5" style={{ textAlign: textStart }}>
          {s.welcomeTitle}
        </Text>
        <Text className="text-text-dim font-regular mt-2" style={{ textAlign: textStart }}>
          {s.onboardingIntro}
        </Text>

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

        <Pressable
          className={`bg-green rounded-button py-[14px] items-center mt-6${saving ? " opacity-60" : ""}`}
          onPress={finish}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={green.onGreen} />
          ) : (
            <Text className="text-on-green font-semibold text-[14px]">{s.startTracking}</Text>
          )}
        </Pressable>
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

function PickRow({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  const green = useColors();
  return (
    <View className="mt-4">
      <Text className="text-text font-semibold mb-2" style={{ textAlign: textStart }}>{label}</Text>
      <Pressable
        className="flex-row items-center justify-between bg-card-soft rounded-input px-[18px] py-4"
        onPress={onPress}
      >
        <Text className="text-text text-[20px] font-mono-semibold">{value}</Text>
        <MaterialIcons name="edit" size={18} color={green.textDim} />
      </Pressable>
    </View>
  );
}
