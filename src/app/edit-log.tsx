/**
 * Edit-log modal (full-screen route, presented modally). Opened from the Diary /
 * Today detail sheet's pencil for a today entry. Full-screen so a long diary has
 * room and respects safe areas. Edits the time, location, comment + diary and
 * saves via the store. Light/dark themed.
 */
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatTime } from "@/i18n/format";
import { inputAlign, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { LocationTag } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { fonts, makeUseStyles, radius, spacing, type, useColors, useIsDark } from "@/theme";

type TagDef = { key: LocationTag; label: string; icon: keyof typeof MaterialIcons.glyphMap };

export default function EditLogModal() {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
  const isDark = useIsDark();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const logs = useAppStore((st) => st.logs);
  const editLog = useAppStore((st) => st.editLog);

  const log = useMemo(() => logs.find((l) => l.id === id) ?? null, [logs, id]);

  const [tag, setTag] = useState<LocationTag>(log?.tag ?? "home");
  const [comment, setComment] = useState(log?.comment ?? "");
  const [diary, setDiary] = useState(log?.diary ?? "");
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
    if (!log) return close();
    setSaving(true);
    try {
      // Any time is allowed, including the future (logging a smoke you're about to have).
      await editLog(log.id, { tag, comment: comment.trim(), diary: diary.trim(), smokedAt });
      close();
    } catch (e) {
      Alert.alert(`${s.couldNotSave}: ${e}`);
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={8} style={styles.headerBtn}>
          <Text style={styles.cancel}>{s.cancel}</Text>
        </Pressable>
        <Text style={styles.title}>{s.editEntry}</Text>
        <Pressable onPress={save} hitSlop={8} disabled={saving} style={[styles.headerBtn, styles.saveBtnWrap]}>
          {saving ? <ActivityIndicator color={green.green} /> : <Text style={styles.saveBtn}>{s.save}</Text>}
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        {/* Time card */}
        {log && (
          <View style={styles.timeRow}>
            <View style={styles.timeLeft}>
              <View style={styles.timeIcon}>
                <MaterialIcons name="schedule" size={18} color={green.green} />
              </View>
              <Text style={styles.timeLabel}>{s.timeLabel}</Text>
            </View>
            {Platform.OS === "ios" ? (
              <View style={styles.timePickerWrap}>
                <DateTimePicker
                  mode="time"
                  value={smokedAt}
                  display="compact"
                  accentColor={green.green}
                  themeVariant={isDark ? "dark" : "light"}
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

        {/* Location (task: edit where you were) */}
        <Text style={styles.fieldLabel}>{s.whereWereYou}</Text>
        <View style={styles.tagGrid}>
          {tags.map((t) => {
            const sel = tag === t.key;
            return (
              <Pressable key={t.key} style={[styles.tagBtn, sel && styles.tagBtnSel]} onPress={() => setTag(t.key)}>
                <MaterialIcons name={t.icon} size={18} color={sel ? green.greenDeep : green.textSecondary} />
                <Text style={[styles.tagText, sel && styles.tagTextSel]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: green.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: green.border,
    },
    headerBtn: { minWidth: 64, justifyContent: "center" },
    saveBtnWrap: { alignItems: "flex-end" },
    cancel: { color: green.textDim, fontSize: type.body.fontSize, fontFamily: fonts.medium },
    title: { color: green.text, fontSize: 18, fontFamily: fonts.bold },
    saveBtn: { color: green.green, fontSize: type.body.fontSize, fontFamily: fonts.bold },
    body: { padding: spacing.lg, gap: spacing.md },

    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: green.cardSoft,
      borderRadius: radius.input,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    timeLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    timeIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: green.card,
      alignItems: "center",
      justifyContent: "center",
    },
    timePickerWrap: { width: 112, height: 36, overflow: "hidden", justifyContent: "center", alignItems: "flex-end" },
    timeLabel: { color: green.text, fontSize: type.body.fontSize, fontFamily: fonts.semibold },
    timeValue: { color: green.text, fontFamily: fonts.monoMedium, fontSize: 16 },
    timeEditBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: green.card,
      borderRadius: radius.chip,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    timePicker: { width: 112, height: 36 },

    tagGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    tagBtn: {
      flexBasis: "47%",
      flexGrow: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: green.card,
      borderWidth: 1,
      borderColor: green.border,
      borderRadius: radius.input,
      paddingVertical: 12,
      paddingHorizontal: spacing.md,
    },
    tagBtnSel: { backgroundColor: green.greenBright, borderColor: green.greenBright },
    tagText: { color: green.textSecondary, fontSize: 14, fontFamily: fonts.semibold },
    tagTextSel: { color: green.greenDeep },

    fieldBlock: { gap: spacing.xs },
    fieldLabel: { color: green.textSecondary, fontSize: 13, fontFamily: fonts.semibold, textAlign: textStart },
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
    diary: { minHeight: 200 },
  }),
);
