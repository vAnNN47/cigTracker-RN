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
import { colors, fonts, radius, spacing, type } from "@/theme";

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

  // Keep the picked time on the entry's own day, never in the future.
  const clampToLogDay = (picked: Date) => {
    const base = log?.smokedAt ?? new Date();
    const d = new Date(base);
    d.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    const now = new Date();
    return d.getTime() > now.getTime() ? now : d;
  };

  const close = () => router.back();
  const save = async () => {
    if (!log) return close();
    setSaving(true);
    await editLog(log.id, { comment: comment.trim(), diary: diary.trim(), smokedAt });
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
          {saving ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.saveBtn}>{s.save}</Text>}
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
              <MaterialIcons name="schedule" size={16} color={colors.textDim} />
              <Text style={styles.timeLabel}>{s.timeLabel}</Text>
              <View style={{ flex: 1 }} />
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  mode="time"
                  value={smokedAt}
                  display="compact"
                  accentColor={colors.accent}
                  themeVariant="dark"
                  onValueChange={(_e, d) => setSmokedAt(clampToLogDay(d))}
                  style={styles.timePicker}
                />
              ) : (
                <Pressable style={styles.timeEditBtn} onPress={() => setShowPicker(true)}>
                  <Text style={styles.timeValue}>{formatTime(smokedAt)}</Text>
                  <MaterialIcons name="edit" size={14} color={colors.accent} />
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
              accentColor={colors.accent}
              onValueChange={(_e, d) => {
                setSmokedAt(clampToLogDay(d));
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
              placeholderTextColor={colors.textDim}
              value={comment}
              onChangeText={setComment}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>{s.diary}</Text>
            <TextInput
              style={[styles.input, styles.diary, inputAlign]}
              placeholder={s.diaryHint}
              placeholderTextColor={colors.textDim}
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
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  cancel: { color: colors.textDim, fontSize: type.body.fontSize, fontFamily: fonts.regular },
  title: { color: colors.text, fontSize: 17, fontFamily: fonts.bold },
  saveBtn: { color: colors.accent, fontSize: type.body.fontSize, fontFamily: fonts.bold },
  body: { padding: spacing.md },
  form: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeLabel: { color: colors.textDim, fontSize: type.body.fontSize, fontFamily: fonts.regular },
  timeValue: { color: colors.text, fontFamily: fonts.monoMedium },
  timeEditBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  // Explicit width so the native SwiftUI picker host doesn't overflow the row.
  timePicker: { width: 112, height: 36 },
  fieldBlock: { gap: spacing.xs },
  fieldLabel: { color: colors.textDim, fontSize: 13, fontFamily: fonts.regular, textAlign: textStart },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: type.body.fontSize,
    fontFamily: fonts.regular,
    textAlign: textStart,
  },
  diary: { minHeight: 220 },
});
