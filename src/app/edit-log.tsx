/**
 * Add / edit log modal (full-screen route). Two modes by params:
 *  - EDIT (`id`): opened from the Diary / Today detail sheet's pencil; edits an
 *    existing today entry via the store.
 *  - ADD (no `id`, optional `tag` + `comment` prefill): the "more details"
 *    escalation from the quick log sheet — a full screen for the longer fields
 *    (time + diary) per the platform rule that complex content leaves the sheet.
 * Full-screen so a long diary has room and respects safe areas. Light/dark themed.
 */
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { useToast } from "@/components/feedback/Toast";
import { formatTime } from "@/i18n/format";
import { inputAlign, textEnd, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { LocationTag } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { useColors, useIsDark } from "@/theme";
import { Pressable, Text, TextInput, View } from "@/tw";

type TagDef = { key: LocationTag; label: string; icon: keyof typeof MaterialIcons.glyphMap };

/** Full-screen modal route to add a new log or edit a today log's time, location, comment and diary. */
export default function EditLogModal() {
  const s = useStrings();
  const green = useColors();
  const isDark = useIsDark();
  const router = useRouter();
  const toast = useToast();
  const { id, tag: tagParam, comment: commentParam } = useLocalSearchParams<{
    id?: string;
    tag?: string;
    comment?: string;
  }>();
  const logs = useAppStore((st) => st.logs);
  const editLog = useAppStore((st) => st.editLog);
  const addSmoke = useAppStore((st) => st.addSmoke);
  const deleteLog = useAppStore((st) => st.deleteLog);

  const log = useMemo(() => (id ? logs.find((l) => l.id === id) ?? null : null), [logs, id]);
  const isAdd = !id; // no id → creating a new entry (escalated from the quick sheet)

  const [tag, setTag] = useState<LocationTag>(log?.tag ?? (tagParam as LocationTag | undefined) ?? "home");
  // Uncontrolled: native owns the caret (controlled value re-set on iOS jumps it
  // backwards on fast typing). Read at save time only — never displayed elsewhere.
  const commentRef = useRef(log?.comment ?? commentParam ?? "");
  const diaryRef = useRef(log?.diary ?? "");
  const [smokedAt, setSmokedAt] = useState<Date>(log?.smokedAt ?? new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const tags: TagDef[] = [
    { key: "home", label: s.tagHome, icon: "home" },
    { key: "work", label: s.tagWork, icon: "work-outline" },
    { key: "car", label: s.tagCar, icon: "directions-car" },
    { key: "social", label: s.tagSocial, icon: "groups" },
  ];

  const close = () => router.back();
  const save = async () => {
    setSaving(true);
    const fields = { tag, comment: commentRef.current.trim(), diary: diaryRef.current.trim(), smokedAt };
    try {
      // Any time is allowed, including the future (logging a smoke you're about to have).
      if (isAdd) {
        const created = await addSmoke(fields);
        close();
        toast.show({ message: s.loggedToast, actionLabel: s.undo, onAction: () => deleteLog(created.id) });
      } else if (log) {
        await editLog(log.id, fields);
        close();
      } else {
        close(); // edit target vanished (deleted) — nothing to save
      }
    } catch (e) {
      Alert.alert(`${s.couldNotSave}: ${e}`);
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: green.bg }} edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-border">
        <Pressable onPress={close} hitSlop={8} className="min-w-[64px] justify-center">
          <Text className="text-text-dim text-[14px] font-medium" style={{ textAlign: textStart }}>{s.cancel}</Text>
        </Pressable>
        <Text className="text-text text-[18px] font-bold">{isAdd ? s.logACigarette : s.editEntry}</Text>
        <Pressable onPress={save} hitSlop={8} disabled={saving} className="min-w-[64px] justify-center">
          {saving ? (
            <ActivityIndicator color={green.green} />
          ) : (
            <Text className="text-green text-[14px] font-bold" style={{ textAlign: textEnd }}>{isAdd ? s.addToToday : s.save}</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        persistentScrollbar
        // mode="insets" (default) uses an internal contentInset/clipping mechanism that
        // is broken on Android in keyboard-controller 1.21.x (issue #1394) — it fails to
        // extend the scroll range when the keyboard opens, so content stays trapped behind
        // it. "layout" appends a real spacer view instead → genuine scroll range on Android.
        mode="layout"
      >
        {/* Time card (both modes — add defaults to now, edit to the logged time) */}
        <View className="flex-row items-center justify-between bg-card-soft rounded-input px-3 py-3">
            <View className="flex-row items-center gap-3">
              <View className="w-[34px] h-[34px] rounded-[17px] bg-card items-center justify-center">
                <MaterialIcons name="schedule" size={18} color={green.green} />
              </View>
              <Text className="text-text text-[14px] font-semibold">{s.timeLabel}</Text>
            </View>
            {Platform.OS === "ios" ? (
              // Keep the frame snug to the compact picker's content: a wider frame
              // leaves trailing dead-space the native control fills with an artifact
              // in RTL (the time pill is leading-aligned). 44pt tall = min touch target.
              <DateTimePicker
                mode="time"
                value={smokedAt}
                display="compact"
                accentColor={green.green}
                themeVariant={isDark ? "dark" : "light"}
                onValueChange={(_e, d) => setSmokedAt(d)}
                style={{ width: 84, height: 44 }}
              />
            ) : (
              <Pressable className="flex-row items-center gap-1.5 bg-card rounded-chip px-3 py-2" onPress={() => setShowPicker(true)}>
                <Text className="text-text font-mono-medium text-[16px]">{formatTime(smokedAt)}</Text>
                <MaterialIcons name="edit" size={14} color={green.green} />
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

        {/* Location (task: edit where you were) */}
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

        <View className="gap-1">
          <Text className="text-text-secondary text-[13px] font-semibold" style={{ textAlign: textStart }}>{s.comment}</Text>
          <TextInput
            className="bg-card rounded-input border border-border px-3 py-2 text-text text-[14px] font-regular"
            // Platform split: a single-line TextInput with textAlign:"right" breaks ScrollView
            // scroll on Android RTL (RN #16206) — there writingDirection alone right-aligns. But
            // iOS needs textAlign (writingDirection alone leaves the placeholder left) and has no
            // such scroll bug. So: Android → writingDirection only; iOS → full inputAlign.
            style={Platform.OS === "android" ? { writingDirection: inputAlign.writingDirection } : inputAlign}
            placeholder={s.commentHint}
            placeholderTextColor={green.textDim}
            defaultValue={log?.comment ?? commentParam ?? ""}
            onChangeText={(t) => (commentRef.current = t)}
          />
        </View>

        <View className="gap-1">
          <Text className="text-text-secondary text-[13px] font-semibold" style={{ textAlign: textStart }}>{s.diary}</Text>
          <TextInput
            className="bg-card rounded-input border border-border px-3 py-2 text-text text-[14px] font-regular min-h-[200px]"
            style={inputAlign}
            placeholder={s.diaryHint}
            placeholderTextColor={green.textDim}
            defaultValue={log?.diary ?? ""}
            onChangeText={(t) => (diaryRef.current = t)}
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
