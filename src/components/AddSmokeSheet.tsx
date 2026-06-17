/**
 * Log a cigarette — ported from lib/widgets/add_smoke_sheet.dart.
 * Always logged "now". On save: medium haptic, dismiss, and hand the new log
 * back so the caller can show the "Logged ✓ / Undo" toast.
 *
 * Imperative API: parent calls ref.present().
 */
import * as Haptics from "expo-haptics";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useStrings } from "@/i18n/useStrings";
import { SmokeLog } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, type } from "@/theme";

import { KeyboardSheet, KeyboardSheetRef, SheetTextInput } from "../../packages/keyboard-sheet";

export interface AddSmokeSheetRef {
  present: () => void;
}

interface Props {
  onLogged: (log: SmokeLog) => void;
}

export const AddSmokeSheet = forwardRef<AddSmokeSheetRef, Props>(
  function AddSmokeSheet({ onLogged }, ref) {
    const s = useStrings();
    const addSmoke = useAppStore((st) => st.addSmoke);
    const sheetRef = useRef<KeyboardSheetRef>(null);

    const [comment, setComment] = useState("");
    const [diary, setDiary] = useState("");
    const [saving, setSaving] = useState(false);

    useImperativeHandle(ref, () => ({ present: () => sheetRef.current?.present() }));

    const reset = () => {
      setComment("");
      setDiary("");
      setSaving(false);
    };

    const save = async () => {
      setSaving(true);
      try {
        const log = await addSmoke(comment.trim(), diary.trim());
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
        onDismiss={reset}
        backgroundColor={colors.surface}
        handleColor={colors.line}
        cornerRadius={radius.sheet}
      >
        <Text style={styles.title}>{s.logACigarette}</Text>
        <Text style={styles.sub}>{s.loggedNow}</Text>

        <SheetTextInput
          style={styles.input}
          placeholder={s.commentHint}
          placeholderTextColor={colors.textDim}
          value={comment}
          onChangeText={setComment}
        />

        <View style={styles.diaryHeader}>
          <Text style={styles.diaryLabel}>{s.diary}</Text>
          <Pressable onPress={() => Alert.alert(s.whyLockTitle, s.whyLockBody)} hitSlop={8}>
            <Text style={styles.info}>ⓘ</Text>
          </Pressable>
        </View>
        <SheetTextInput
          style={[styles.input, styles.diary]}
          placeholder={s.diaryHint}
          placeholderTextColor={colors.textDim}
          value={diary}
          onChangeText={setDiary}
          multiline
          scrollEnabled={false}
        />

        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? "…" : s.add}</Text>
        </Pressable>
      </KeyboardSheet>
    );
  },
);

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 20, fontWeight: "600" },
  sub: { color: colors.textDim, fontSize: 13 },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: type.body.fontSize,
  },
  diaryHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  diaryLabel: { color: colors.text, fontWeight: "600" },
  info: { color: colors.textDim, fontSize: 16 },
  diary: { height: 110, textAlignVertical: "top" }, // fixed height; long text scrolls inside
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
