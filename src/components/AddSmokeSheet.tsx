/**
 * Log a cigarette — rebuilt to the "haze" design handoff:
 *   1. Where were you?  — 2×2 location tag grid (Home / Work / Car / Social).
 *   2. How did it feel?  — feeling chips + a free-text field (same value: a chip
 *      fills it, typing overrides, tapping the selected chip clears it).
 *   3. Give more info ▾  — expandable: time (to backfill an earlier smoke) + notes.
 *   4. Add to today      — saves { tag, comment(=feeling), diary(=note), smokedAt }.
 *
 * Imperative API: parent calls ref.present().
 */
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { formatTime } from "@/i18n/format";
import { inputAlign, textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { DEFAULT_TAG, LocationTag, SmokeLog } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing, type } from "@/theme";

import { KeyboardSheet, KeyboardSheetRef, SheetTextInput } from "../../packages/keyboard-sheet";

export interface AddSmokeSheetRef {
  present: () => void;
}

interface Props {
  onLogged: (log: SmokeLog) => void;
}

type TagDef = { key: LocationTag; label: string; icon: keyof typeof MaterialIcons.glyphMap };

export const AddSmokeSheet = forwardRef<AddSmokeSheetRef, Props>(
  function AddSmokeSheet({ onLogged }, ref) {
    const s = useStrings();
    const addSmoke = useAppStore((st) => st.addSmoke);
    const sheetRef = useRef<KeyboardSheetRef>(null);

    const [tag, setTag] = useState<LocationTag>(DEFAULT_TAG);
    const [comment, setComment] = useState(""); // the feeling value
    const [diary, setDiary] = useState("");
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
    const feelings = [s.feelStressed, s.feelBored, s.feelCraving, s.feelSocial, s.feelAfterMeal, s.feelHabit];

    useImperativeHandle(ref, () => ({
      present: () => {
        setTag(DEFAULT_TAG);
        setComment("");
        setDiary("");
        setSmokedAt(new Date());
        setExpanded(false);
        setShowPicker(false);
        setSaving(false);
        sheetRef.current?.present();
      },
    }));

    // Keep the picked time on today's date and never in the future.
    const clampToday = (picked: Date) => {
      const now = new Date();
      const d = new Date();
      d.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
      return d.getTime() > now.getTime() ? now : d;
    };

    const save = async () => {
      setSaving(true);
      try {
        const log = await addSmoke({ tag, comment: comment.trim(), diary: diary.trim(), smokedAt });
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
        backgroundColor={colors.surface}
        handleColor={colors.line}
        cornerRadius={radius.sheet}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{s.logACigarette}</Text>

          {/* 1. Where were you? */}
          <Text style={styles.label}>{s.whereWereYou}</Text>
          <View style={styles.tagGrid}>
            {tags.map((t) => {
              const sel = tag === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[styles.tagBtn, sel && styles.tagBtnSel]}
                  onPress={() => setTag(t.key)}
                >
                  <MaterialIcons name={t.icon} size={18} color={sel ? colors.onAccent : colors.textSecondary} />
                  <Text style={[styles.tagText, sel && styles.tagTextSel]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* 2. How did it feel? */}
          <Text style={styles.label}>{s.howDidItFeel}</Text>
          <View style={styles.chipWrap}>
            {feelings.map((f) => {
              const sel = comment.trim() === f;
              return (
                <Pressable
                  key={f}
                  style={[styles.feelChip, sel && styles.feelChipSel]}
                  onPress={() => setComment(sel ? "" : f)}
                >
                  <Text style={[styles.feelChipText, sel && styles.feelChipTextSel]}>{f}</Text>
                </Pressable>
              );
            })}
          </View>
          <SheetTextInput
            style={[styles.input, inputAlign]}
            placeholder={s.feelingHint}
            placeholderTextColor={colors.textDim}
            value={comment}
            onChangeText={setComment}
          />

          {/* 3. Give more info ▾ */}
          <Pressable style={styles.moreToggle} onPress={() => setExpanded((v) => !v)} hitSlop={6}>
            <Text style={styles.moreText}>{s.giveMoreInfo}</Text>
            <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={20} color={colors.accent} />
          </Pressable>

          {expanded && (
            <View style={styles.moreBody}>
              <View style={styles.whenRow}>
                <Text style={styles.whenLabel}>{s.whenQ}</Text>
                {Platform.OS === "ios" ? (
                  <View style={styles.timePickerWrap}>
                    <DateTimePicker
                      mode="time"
                      value={smokedAt}
                      display="compact"
                      accentColor={colors.accent}
                      themeVariant="dark"
                      onValueChange={(_e, d) => setSmokedAt(clampToday(d))}
                      style={styles.timePicker}
                    />
                  </View>
                ) : (
                  <Pressable style={styles.timePill} onPress={() => setShowPicker(true)}>
                    <MaterialIcons name="schedule" size={15} color={colors.accent} />
                    <Text style={styles.timePillText}>{formatTime(smokedAt)}</Text>
                  </Pressable>
                )}
              </View>
              {showPicker && Platform.OS !== "ios" && (
                <DateTimePicker
                  mode="time"
                  value={smokedAt}
                  is24Hour
                  display="default"
                  accentColor={colors.accent}
                  onValueChange={(_e, d) => {
                    setSmokedAt(clampToday(d));
                    setShowPicker(false);
                  }}
                  onDismiss={() => setShowPicker(false)}
                />
              )}

              <Text style={[styles.label, { marginTop: spacing.md }]}>{s.anythingElse}</Text>
              <SheetTextInput
                style={[styles.input, styles.notes, inputAlign]}
                placeholder={s.diaryHint}
                placeholderTextColor={colors.textDim}
                value={diary}
                onChangeText={setDiary}
                multiline
                scrollEnabled={false}
              />
            </View>
          )}

          <Pressable
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={save}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.onAccent} />
            ) : (
              <Text style={styles.buttonText}>{s.addToToday}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardSheet>
    );
  },
);

const styles = StyleSheet.create({
  card: { padding: spacing.md, gap: spacing.sm },
  title: { color: colors.text, fontSize: 20, fontFamily: fonts.semibold, textAlign: textStart, marginBottom: spacing.xs },
  label: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.semibold, textAlign: textStart },

  tagGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tagBtn: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.input,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  tagBtnSel: { backgroundColor: colors.accent, borderColor: colors.accent },
  tagText: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.semibold },
  tagTextSel: { color: colors.onAccent },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  feelChip: {
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  feelChipSel: { backgroundColor: colors.accentSoft, borderColor: colors.accentBorderStrong },
  feelChipText: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.medium },
  feelChipTextSel: { color: colors.accentText },

  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: type.body.fontSize,
    fontFamily: fonts.regular,
  },
  notes: { height: 90, textAlignVertical: "top" },

  moreToggle: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: spacing.xs, marginTop: spacing.xs },
  moreText: { color: colors.accent, fontSize: 14, fontFamily: fonts.semibold },
  moreBody: { gap: spacing.sm },
  whenRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  whenLabel: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.semibold },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.fill,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  timePillText: { color: colors.accent, fontFamily: fonts.monoMedium, fontSize: 14 },
  timePickerWrap: { width: 112, height: 36, overflow: "hidden", justifyContent: "center", alignItems: "flex-end" },
  timePicker: { width: 112, height: 36 },

  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.onAccent, fontFamily: fonts.semibold, fontSize: type.body.fontSize },
});
