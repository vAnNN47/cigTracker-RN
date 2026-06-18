/**
 * Edit-log modal (full-screen route, presented modally). Opened from the Diary /
 * Today detail sheet's pencil for a today entry. Full-screen so a long diary has
 * room and respects safe areas (fixes the bottom-sheet overflow). Edits the
 * comment + diary and saves via the store.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatTime } from "@/i18n/format";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, type } from "@/theme";

export default function EditLogModal() {
  const s = useStrings();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const logs = useAppStore((st) => st.logs);
  const editLog = useAppStore((st) => st.editLog);

  const log = useMemo(() => logs.find((l) => l.id === id) ?? null, [logs, id]);

  const [comment, setComment] = useState(log?.comment ?? "");
  const [diary, setDiary] = useState(log?.diary ?? "");
  const [saving, setSaving] = useState(false);

  const close = () => router.back();
  const save = async () => {
    if (!log) return close();
    setSaving(true);
    await editLog(log.id, { comment: comment.trim(), diary: diary.trim() });
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
          <Text style={styles.saveBtn}>{saving ? "…" : s.save}</Text>
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        {log && (
          <View style={styles.timeRow}>
            <MaterialIcons name="schedule" size={16} color={colors.textDim} />
            <Text style={styles.timeLabel}>{s.timeLabel}</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.timeValue}>{formatTime(log.smokedAt)}</Text>
          </View>
        )}

        <Text style={styles.fieldLabel}>{s.comment}</Text>
        <TextInput
          style={styles.input}
          placeholder={s.commentHint}
          placeholderTextColor={colors.textDim}
          value={comment}
          onChangeText={setComment}
        />

        <View style={styles.diaryHeader}>
          <Text style={styles.fieldLabel}>{s.diary}</Text>
        </View>
        <TextInput
          style={[styles.input, styles.diary]}
          placeholder={s.diaryHint}
          placeholderTextColor={colors.textDim}
          value={diary}
          onChangeText={setDiary}
          multiline
          textAlignVertical="top"
        />
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
  cancel: { color: colors.textDim, fontSize: type.body.fontSize },
  title: { color: colors.text, fontSize: 17, fontWeight: "700" },
  saveBtn: { color: colors.accent, fontSize: type.body.fontSize, fontWeight: "700" },
  body: { padding: spacing.xl, gap: spacing.xs },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.fill,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  timeLabel: { color: colors.textDim, fontSize: type.body.fontSize },
  timeValue: { color: colors.text, fontWeight: "700" },
  fieldLabel: { color: colors.textDim, fontSize: 13, marginTop: spacing.md, marginBottom: spacing.xs },
  diaryHeader: { flexDirection: "row", alignItems: "center" },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: type.body.fontSize,
  },
  diary: { minHeight: 220 },
});
