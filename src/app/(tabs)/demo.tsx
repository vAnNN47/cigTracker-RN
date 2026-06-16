/**
 * Demo tab — exercises the standalone packages/keyboard-sheet exactly like a
 * fresh app would (relative import, props for theming, no app internals).
 * Proves the extracted package is transferable.
 */
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardSheet, KeyboardSheetRef, SheetTextInput } from "../../../packages/keyboard-sheet";
import { colors, radius, spacing, type } from "@/theme";

export default function DemoScreen() {
  const insets = useSafeAreaInsets();
  const sheet = useRef<KeyboardSheetRef>(null);

  const [comment, setComment] = useState("");
  const [diary, setDiary] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setComment("");
    setDiary("");
    setSaving(false);
  };

  const fakeSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      sheet.current?.dismiss();
    }, 1200);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={styles.h1}>keyboard-sheet demo</Text>
      <Text style={styles.sub}>
        Imported from packages/keyboard-sheet — the same module you can drop into any app.
      </Text>

      <Pressable style={styles.openBtn} onPress={() => sheet.current?.present()}>
        <Text style={styles.openText}>Open sheet</Text>
      </Pressable>

      <KeyboardSheet
        ref={sheet}
        onDismiss={reset}
        backgroundColor={colors.surface}
        handleColor={colors.line}
        cornerRadius={radius.sheet}
      >
        <Text style={styles.sheetTitle}>Demo entry</Text>

        <SheetTextInput
          style={styles.input}
          placeholder="Quick comment"
          placeholderTextColor={colors.textDim}
          value={comment}
          onChangeText={setComment}
        />
        <SheetTextInput
          style={[styles.input, styles.diary]}
          placeholder="How do you feel right now?"
          placeholderTextColor={colors.textDim}
          value={diary}
          onChangeText={setDiary}
          multiline
          scrollEnabled={false}
        />

        <Pressable
          style={[styles.saveBtn, saving && styles.saveDisabled]}
          onPress={fakeSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </Pressable>
      </KeyboardSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl, gap: spacing.md },
  h1: { color: colors.text, fontSize: 24, fontWeight: "700" },
  sub: { color: colors.textDim, fontSize: type.label.fontSize, marginBottom: spacing.lg },
  openBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  openText: { color: colors.onAccent, fontWeight: "600", fontSize: type.body.fontSize },
  sheetTitle: { color: colors.text, fontSize: 20, fontWeight: "600" },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: type.body.fontSize,
  },
  diary: { height: 110, textAlignVertical: "top" },
  saveBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: colors.onAccent, fontWeight: "600", fontSize: type.body.fontSize },
});
