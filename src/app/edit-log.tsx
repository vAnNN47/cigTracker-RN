/**
 * Edit-log modal (full-screen route, presented modally). Opened from the Diary /
 * Today detail sheet's pencil for a today entry. Full-screen so a long diary has
 * room and respects safe areas (fixes the bottom-sheet overflow). Edits the
 * time (for entries logged late), comment + diary and saves via the store.
 */
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatTime } from "@/i18n/format";
import { inputAlign, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { fonts, green, radius, spacing, type } from "@/theme";

export default function EditLogModal() {
  const s = useStrings();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const logs = useAppStore((st) => st.logs);
  const editLog = useAppStore((st) => st.editLog);

  const log = useMemo(() => logs.find((l) => l.id === id) ?? null, [logs, id]);

  const [comment, setComment] = useState(log?.comment ?? "");
  const [diary, setDiary] = useState(log?.diary ?? "");
  const [smokedAt, setSmokedAt] = useState<Date>(log?.smokedAt ?? new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const close = () => router.back();
  const save = async () => {
    if (!log) return close();
    setSaving(true);
    // Pick any time freely; only prevent a future time at save.
    const when = smokedAt.getTime() > Date.now() ? new Date() : smokedAt;
    await editLog(log.id, { comment: comment.trim(), diary: diary.trim(), smokedAt: when });
    close();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={8}>
          <Text style={styles.cancel}>{s.cancel}</Text>
        </Pressable>
        <Text style={styles.title}>{s.editEntry}</Text>
        <Pressable onPress={save} hitSlop={8} disabled={saving}>
          {saving ? <ActivityIndicator color={green.green} /> : <Text style={styles.saveBtn}>{s.save}</Text>}
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <View style={styles.form}>
          {log && (
            <View style={styles.timeRow}>
              <View style={styles.timeLeft}>
                <MaterialIcons name="schedule" size={16} color={green.textDim} />
                <Text style={styles.timeLabel}>{s.timeLabel}</Text>
              </View>
              {Platform.OS === "ios" ? (
                <View style={styles.timePickerWrap}>
                  <DateTimePicker
                    mode="time"
                    value={smokedAt}
                    display="compact"
                    accentColor={green.green}
                    themeVariant="light"
                    onValueChange={(_e, d) => setSmokedAt(d)}
                    style={styles.timePicker}
                  />
                </View>
              ) : (
                <Pressable style={styles.timeEditBtn} onPress={() => setShowPicker(true)}>
                  <Text style={styles.timeValue}>{formatTime(smokedAt)}</Text>
                  <MaterialIcons name="edit" size={14} color={green.green} />
                </Pressable>
              )}
            </View>
          )}
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

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{s.comment}</Text>
            <TextInput
              style={[styles.input, inputAlign]}
              placeholder={s.commentHint}
              placeholderTextColor={green.textDim}
              value={comment}
              onChangeText={setComment}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{s.diary}</Text>
            <TextInput
              style={[styles.input, styles.diary, inputAlign]}
              placeholder={s.diaryHint}
              placeholderTextColor={green.textDim}
              value={diary}
              onChangeText={setDiary}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: green.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: green.border,
  },
  cancel: { color: green.textDim, fontSize: type.body.fontSize, fontFamily: fonts.regular },
  title: { color: green.text, fontSize: 17, fontFamily: fonts.bold },
  saveBtn: { color: green.green, fontSize: type.body.fontSize, fontFamily: fonts.bold },
  body: { padding: spacing.md },
  form: {
    backgroundColor: green.card,
    borderWidth: 1,
    borderColor: green.border,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: green.cardSoft,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  // Fixed box that clips the native picker so it can't bleed past the row edge.
  timePickerWrap: { width: 112, height: 36, overflow: "hidden", justifyContent: "center" },
  timeLabel: { color: green.textDim, fontSize: type.body.fontSize, fontFamily: fonts.regular },
  timeValue: { color: green.text, fontFamily: fonts.monoMedium },
  timeEditBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  // Explicit width so the native SwiftUI picker host doesn't overflow the row.
  timePicker: { width: 112, height: 36 },
  fieldBlock: { gap: spacing.xs },
  fieldLabel: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, textAlign: textStart },
  input: {
    backgroundColor: green.card,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: green.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: green.text,
    fontSize: type.body.fontSize,
    fontFamily: fonts.regular,
    textAlign: textStart,
  },
  diary: { minHeight: 220 },
});
