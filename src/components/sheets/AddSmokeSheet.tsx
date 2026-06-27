/**
 * Log a cigarette — "v2" light/green theme, same logic as before:
 *   1. Where were you?  — 2×2 location tag grid (Home / Work / Car / Social).
 *   2. How did it feel?  — feeling chips + a free-text field (same value).
 *   3. More details ▾    — expandable: time (backfill an earlier smoke) + notes.
 *   4. Add to today      — saves { tag, comment(=feeling), diary(=note), smokedAt }.
 *
 * Notes field has a fixed height + internal scroll so long text stays readable
 * and scrolling it no longer drags the whole sheet.
 */
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, TextInput } from "react-native";

import { formatTime } from "@/i18n/format";
import { inputAlign, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { DEFAULT_TAG, LocationTag, SmokeLog } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { fonts, radius, useColors, useIsDark } from "@/theme";
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
    const isDark = useIsDark();
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
    // it backwards on fast typing). Captured in refs, read only at save; the input
    // refs let present() clear the fields since the sheet stays mounted across opens.
    const commentRef = useRef(""); // the feeling value
    const diaryRef = useRef("");
    const commentInput = useRef<TextInput>(null);
    const diaryInput = useRef<TextInput>(null);
    const [smokedAt, setSmokedAt] = useState<Date>(new Date());
    const [expanded, setExpanded] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
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
        diaryRef.current = "";
        commentInput.current?.clear();
        diaryInput.current?.clear();
        setSmokedAt(new Date());
        setExpanded(false);
        setShowPicker(false);
        setSaving(false);
        sheetRef.current?.present();
      },
    }));

    const save = async () => {
      setSaving(true);
      try {
        // Any time is allowed, including the future (logging a smoke you're about to have).
        const log = await addSmoke({ tag, comment: commentRef.current.trim(), diary: diaryRef.current.trim(), smokedAt });
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        sheetRef.current?.dismiss();
        onLogged(log);
      } catch (e) {
        Alert.alert(`${s.couldNotSave}: ${e}`);
        setSaving(false);
      }
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

          {/* 3. More details ▾ */}
          <Pressable className="flex-row items-center justify-center gap-1 py-2 mt-1 bg-card-soft rounded-input" onPress={() => setExpanded((v) => !v)} hitSlop={6}>
            <Text className="text-green text-[14px] font-semibold">{s.giveMoreInfo}</Text>
            <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={20} color={green.green} />
          </Pressable>

          {expanded && (
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-text-secondary text-[13px] font-semibold">{s.whenQ}</Text>
                {Platform.OS === "ios" ? (
                  <View className="w-[112px] h-9 overflow-hidden justify-center items-end">
                    <DateTimePicker
                      mode="time"
                      value={smokedAt}
                      display="compact"
                      accentColor={green.green}
                      themeVariant={isDark ? "dark" : "light"}
                      onValueChange={(_e, d) => setSmokedAt(d)}
                      style={{ width: 112, height: 36 }}
                    />
                  </View>
                ) : (
                  <Pressable className="flex-row items-center gap-1.5 bg-card-soft rounded-chip px-2 py-1" onPress={() => setShowPicker(true)}>
                    <MaterialIcons name="schedule" size={15} color={green.green} />
                    <Text className="text-green font-mono-medium text-[14px]">{formatTime(smokedAt)}</Text>
                  </Pressable>
                )}
              </View>
              {showPicker && Platform.OS !== "ios" && (
                <DateTimePicker
                  mode="time"
                  value={smokedAt}
                  is24Hour
                  display="default"
                  accentColor={green.green}
                  onValueChange={(_e, d) => {
                    setSmokedAt(d);
                    setShowPicker(false);
                  }}
                  onDismiss={() => setShowPicker(false)}
                />
              )}

              <Text className="text-text-secondary text-[13px] font-semibold mt-3" style={{ textAlign: textStart }}>{s.anythingElse}</Text>
              <SheetTextInput
                ref={diaryInput}
                style={[inputStyle, { height: 96, textAlignVertical: "top" }, inputAlign]}
                placeholder={s.diaryHint}
                placeholderTextColor={green.textDim}
                defaultValue=""
                onChangeText={(t) => (diaryRef.current = t)}
                multiline
                scrollEnabled
              />
            </View>
          )}

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
