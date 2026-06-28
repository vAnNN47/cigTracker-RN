/**
 * Log a cigarette — quick bottom sheet (kept deliberately short per the platform
 * rule that complex content leaves the sheet):
 *   1. Where were you?  — 2×2 location tag grid (Home / Work / Car / Social).
 *   2. How did it feel?  — a free-text field.
 *   3. More details →    — escalates to the full-screen add modal (`/edit-log`,
 *      no id) carrying tag + feeling, where time + notes live.
 *   4. Add to today      — quick save { tag, comment(=feeling), smokedAt = now }.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ActivityIndicator, Alert, I18nManager, TextInput } from "react-native";

import { inputAlign, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { DEFAULT_TAG, LocationTag, SmokeLog } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { fonts, radius, useColors } from "@/theme";
import { Pressable, Text, View } from "@/tw";

import { KeyboardSheet, KeyboardSheetRef, SheetTextInput } from "../../../packages/keyboard-sheet";

export interface AddSmokeSheetRef {
  present: () => void;
}

interface Props {
  onLogged: (log: SmokeLog) => void;
}

type TagDef = { key: LocationTag; label: string; icon: keyof typeof MaterialIcons.glyphMap };

/** Log-a-cigarette bottom sheet (tag, feeling, time, notes); opened via ref.present(). */
export const AddSmokeSheet = forwardRef<AddSmokeSheetRef, Props>(
  function AddSmokeSheet({ onLogged }, ref) {
    const s = useStrings();
    const green = useColors();
    const router = useRouter();
    const addSmoke = useAppStore((st) => st.addSmoke);
    const sheetRef = useRef<KeyboardSheetRef>(null);

    // SheetTextInput (keyboard-sheet package) isn't a className-wrapped element, so
    // its style stays a token-built inline object (shared by both inputs).
    const inputStyle = {
      backgroundColor: green.card,
      borderWidth: 1,
      borderColor: green.border,
      borderRadius: radius.input,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: green.text,
      fontSize: 14,
      fontFamily: fonts.regular,
    } as const;

    const [tag, setTag] = useState<LocationTag>(DEFAULT_TAG);
    // Uncontrolled: native owns the caret (a controlled value re-set on iOS jumps
    // it backwards on fast typing). Captured in a ref, read only at save; the input
    // ref lets present() clear the field since the sheet stays mounted across opens.
    const commentRef = useRef(""); // the feeling value
    const commentInput = useRef<TextInput>(null);
    const [saving, setSaving] = useState(false);

    const tags: TagDef[] = [
      { key: "home", label: s.tagHome, icon: "home" },
      { key: "work", label: s.tagWork, icon: "work-outline" },
      { key: "car", label: s.tagCar, icon: "directions-car" },
      { key: "social", label: s.tagSocial, icon: "groups" },
    ];

    useImperativeHandle(ref, () => ({
      present: () => {
        setTag(DEFAULT_TAG);
        commentRef.current = "";
        commentInput.current?.clear();
        setSaving(false);
        sheetRef.current?.present();
      },
    }));

    const save = async () => {
      setSaving(true);
      try {
        // Quick log: now, no diary. (Backfilling a time or adding notes is the
        // "more details" path → the full-screen add modal.)
        const log = await addSmoke({ tag, comment: commentRef.current.trim(), diary: "", smokedAt: new Date() });
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        sheetRef.current?.dismiss();
        onLogged(log);
      } catch (e) {
        Alert.alert(`${s.couldNotSave}: ${e}`);
        setSaving(false);
      }
    };

    // Escalate to the full-screen modal for the longer fields (time + notes),
    // carrying the tag + feeling already entered. Dismiss the sheet first.
    const openDetails = () => {
      sheetRef.current?.dismiss();
      router.push({ pathname: "/edit-log", params: { tag, comment: commentRef.current } });
    };

    return (
      <KeyboardSheet
        ref={sheetRef}
        dismissMode="keyboard"
        backgroundColor={green.bg}
        handleColor={green.border}
        cornerRadius={radius.sheet}
      >
        <View className="p-3 gap-2">
          <Text className="text-text text-[20px] font-bold mb-1" style={{ textAlign: textStart }}>{s.logACigarette}</Text>

          {/* 1. Where were you? */}
          <Text className="text-text-secondary text-[13px] font-semibold" style={{ textAlign: textStart }}>{s.whereWereYou}</Text>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((t) => {
              const sel = tag === t.key;
              return (
                <Pressable
                  key={t.key}
                  className={`basis-[47%] grow flex-row items-center gap-2 border rounded-input py-3 px-3 ${sel ? "bg-green-bright border-green-bright" : "bg-card border-border"}`}
                  onPress={() => setTag(t.key)}
                >
                  <MaterialIcons name={t.icon} size={18} color={sel ? green.greenDeep : green.textSecondary} />
                  <Text className={`${sel ? "text-green-deep" : "text-text-secondary"} text-[14px] font-semibold`}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* 2. How did it feel? — free text, the user types it themselves. */}
          <Text className="text-text-secondary text-[13px] font-semibold" style={{ textAlign: textStart }}>{s.howDidItFeel}</Text>
          <SheetTextInput
            ref={commentInput}
            style={[inputStyle, inputAlign]}
            placeholder={s.feelingHint}
            placeholderTextColor={green.textDim}
            defaultValue=""
            onChangeText={(t) => (commentRef.current = t)}
          />

          {/* 3. More details → full-screen modal (time + notes) */}
          <Pressable className="flex-row items-center justify-center gap-1 py-2 mt-1 bg-card-soft rounded-input" onPress={openDetails} hitSlop={6} accessibilityRole="button" accessibilityLabel={s.giveMoreInfo}>
            <Text className="text-green text-[14px] font-semibold">{s.giveMoreInfo}</Text>
            <MaterialIcons name={I18nManager.isRTL ? "arrow-back" : "arrow-forward"} size={18} color={green.green} />
          </Pressable>

          <Pressable
            className={`mt-2 bg-green rounded-button py-[14px] items-center${saving ? " opacity-60" : ""}`}
            onPress={save}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={green.onGreen} />
            ) : (
              <Text className="text-on-green font-semibold text-[14px]">{s.addToToday}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardSheet>
    );
  },
);
