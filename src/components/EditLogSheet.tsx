/**
 * Edit an existing log's comment/diary — ported from _editLog in home_screen.dart.
 * Only reachable while the log belongs to the current logical day (caller gates).
 *
 * Imperative API: parent calls ref.present(log).
 */
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";

import { useStrings } from "@/i18n/useStrings";
import { SmokeLog } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, type } from "@/theme";

import { BottomSheet, BottomSheetRef } from "./BottomSheet";

export interface EditLogSheetRef {
  present: (log: SmokeLog) => void;
}

export const EditLogSheet = forwardRef<EditLogSheetRef, object>(
  function EditLogSheet(_props, ref) {
    const s = useStrings();
    const editLog = useAppStore((st) => st.editLog);
    const sheetRef = useRef<BottomSheetRef>(null);

    const [logId, setLogId] = useState<string | null>(null);
    const [comment, setComment] = useState("");
    const [diary, setDiary] = useState("");
    const [saving, setSaving] = useState(false);

    useImperativeHandle(ref, () => ({
      present: (log: SmokeLog) => {
        setLogId(log.id);
        setComment(log.comment);
        setDiary(log.diary);
        sheetRef.current?.present();
      },
    }));

    const save = async () => {
      if (!logId) return;
      setSaving(true);
      await editLog(logId, { comment: comment.trim(), diary: diary.trim() });
      setSaving(false);
      sheetRef.current?.dismiss();
    };

    return (
      <BottomSheet ref={sheetRef}>
        <Text style={styles.title}>{s.editEntry}</Text>
        <TextInput
          style={styles.input}
          placeholder={s.comment}
          placeholderTextColor={colors.textDim}
          value={comment}
          onChangeText={setComment}
        />
        <TextInput
          style={[styles.input, styles.diary]}
          placeholder={s.diaryTodayOnly}
          placeholderTextColor={colors.textDim}
          value={diary}
          onChangeText={setDiary}
          multiline
        />
        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? "…" : s.save}</Text>
        </Pressable>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 18, fontWeight: "600" },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: type.body.fontSize,
  },
  diary: { minHeight: 90, textAlignVertical: "top" },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.onAccent, fontWeight: "600", fontSize: type.body.fontSize },
});
