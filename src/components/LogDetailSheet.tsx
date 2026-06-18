/**
 * Tap-to-open log detail sheet (read-only). Shows the entry's time, comment and
 * diary. When the log is editable (today) a pencil opens the full-screen edit
 * modal (/edit-log); past days show the lock explanation instead. Keeping this a
 * compact read view means a long diary no longer blows up the sheet height —
 * editing long text happens on the dedicated modal screen.
 *
 * Imperative API: parent calls ref.present({ log, number, editable }).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { formatTime } from "@/i18n/format";
import { useStrings } from "@/i18n/useStrings";
import { SmokeLog } from "@/models";
import { colors, radius, spacing, type } from "@/theme";

import { KeyboardSheet, KeyboardSheetRef } from "../../packages/keyboard-sheet";

export interface LogDetailSheetRef {
  present: (args: { log: SmokeLog; number: number; editable: boolean }) => void;
}

export const LogDetailSheet = forwardRef<LogDetailSheetRef, object>(
  function LogDetailSheet(_props, ref) {
    const s = useStrings();
    const router = useRouter();
    const sheetRef = useRef<KeyboardSheetRef>(null);

    const [log, setLog] = useState<SmokeLog | null>(null);
    const [number, setNumber] = useState(0);
    const [editable, setEditable] = useState(false);

    useImperativeHandle(ref, () => ({
      present: ({ log, number, editable }) => {
        setLog(log);
        setNumber(number);
        setEditable(editable);
        sheetRef.current?.present();
      },
    }));

    const time = log ? formatTime(log.smokedAt) : "";

    const openEdit = () => {
      if (!log) return;
      sheetRef.current?.dismiss();
      router.push({ pathname: "/edit-log", params: { id: log.id } });
    };

    return (
      <KeyboardSheet
        ref={sheetRef}
        dismissMode="swipe"
        backgroundColor={colors.surface}
        handleColor={colors.line}
        cornerRadius={radius.sheet}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{s.cigNumber(number)}</Text>
              <Text style={styles.time}>{time}</Text>
            </View>
            {editable && (
              <Pressable style={styles.pencil} onPress={openEdit} hitSlop={8}>
                <MaterialIcons name="edit" size={18} color={colors.accent} />
              </Pressable>
            )}
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeLeft}>
              <MaterialIcons name="schedule" size={16} color={colors.textDim} />
              <Text style={styles.timeLabel}>{s.timeLabel}</Text>
            </View>
            <Text style={styles.timeValue}>{time}</Text>
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>{s.comment}</Text>
            <Text style={styles.readonly}>{log?.comment || "—"}</Text>
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>{s.diary}</Text>
            <Text style={[styles.readonly, styles.readonlyDiary]} numberOfLines={6}>
              {log?.diary || "—"}
            </Text>
          </View>

          {!editable && (
            <View style={styles.lockRow}>
              <MaterialIcons name="lock-outline" size={15} color={colors.textDim} />
              <Text style={styles.lockText}>{s.pastLocked}</Text>
              <Pressable onPress={() => Alert.alert(s.whyLockTitle, s.whyLockBody)} hitSlop={8}>
                <Text style={styles.info}>ⓘ</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardSheet>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: { flexDirection: "row", alignItems: "center" },
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  time: { color: colors.textDim, fontSize: 14, marginTop: 2 },
  pencil: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  timeLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  timeLabel: { color: colors.textDim, fontSize: type.body.fontSize },
  timeValue: { color: colors.text, fontWeight: "700" },
  fieldCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fieldLabel: { color: colors.textDim, fontSize: 13, marginBottom: spacing.xs },
  readonly: {
    color: colors.text,
    fontSize: type.body.fontSize,
  },
  readonlyDiary: { minHeight: 64, fontStyle: "italic" },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.xs },
  lockText: { color: colors.textDim, fontSize: 12, flex: 1 },
  info: { color: colors.textDim, fontSize: 16 },
});
