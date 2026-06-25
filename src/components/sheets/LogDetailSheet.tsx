/**
 * Tap-to-open log detail sheet (read-only), light/dark themed. Shows the entry's
 * number, time, location and notes. Behaviour:
 *  - Empty fields are hidden (no "—" placeholder) so a note-less entry stays
 *    compact (task: don't show an empty diary).
 *  - A long diary is collapsed to a few lines with a "read all" toggle; expanded
 *    it scrolls inside a capped height so the sheet never runs off-screen
 *    (task: tap to open the full text / expand to show everything).
 *  - "Copy text" shares the whole entry as text (the OS sheet's Copy action),
 *    so the user can grab all of it at once (task: copy all text).
 * When the log is editable (today) a pencil opens the full-screen edit modal.
 *
 * Imperative API: parent calls ref.present({ log, number, editable }).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

import { formatTime } from "@/i18n/format";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { LocationTag, SmokeLog } from "@/models";
import { fonts, makeUseStyles, radius, spacing, useColors } from "@/theme";

import { KeyboardSheet, KeyboardSheetRef } from "../../../packages/keyboard-sheet";

const TAG_ICON: Record<LocationTag, keyof typeof MaterialIcons.glyphMap> = {
  home: "home",
  work: "work-outline",
  car: "directions-car",
  social: "groups",
};

export interface LogDetailSheetRef {
  present: (args: { log: SmokeLog; number: number; editable: boolean }) => void;
}

export const LogDetailSheet = forwardRef<LogDetailSheetRef, object>(
  function LogDetailSheet(_props, ref) {
    const s = useStrings();
    const green = useColors();
    const styles = useStyles();
    const router = useRouter();
    const sheetRef = useRef<KeyboardSheetRef>(null);

    const [log, setLog] = useState<SmokeLog | null>(null);
    const [number, setNumber] = useState(0);
    const [editable, setEditable] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useImperativeHandle(ref, () => ({
      present: ({ log, number, editable }) => {
        setLog(log);
        setNumber(number);
        setEditable(editable);
        setExpanded(false);
        sheetRef.current?.present();
      },
    }));

    const time = log ? formatTime(log.smokedAt) : "";
    const comment = log?.comment?.trim() ?? "";
    const diary = log?.diary?.trim() ?? "";
    const hasNotes = !!(comment || diary);
    const tagLabel = log
      ? { home: s.tagHome, work: s.tagWork, car: s.tagCar, social: s.tagSocial }[log.tag]
      : "";

    const openEdit = () => {
      if (!log) return;
      sheetRef.current?.dismiss();
      router.push({ pathname: "/edit-log", params: { id: log.id } });
    };

    const copyAll = () => {
      const parts = [`${s.cigNumber(number)} · ${time}`];
      if (comment) parts.push(comment);
      if (diary) parts.push("", diary);
      Share.share({ message: parts.join("\n") }).catch(() => {});
    };

    return (
      <KeyboardSheet
        ref={sheetRef}
        dismissMode="swipe"
        backgroundColor={green.bg}
        handleColor={green.border}
        cornerRadius={radius.sheet}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{s.cigNumber(number)}</Text>
              <Text style={styles.time}>{time}</Text>
            </View>
            {editable && (
              <Pressable style={styles.iconBtn} onPress={openEdit} hitSlop={8}>
                <MaterialIcons name="edit" size={18} color={green.green} />
              </Pressable>
            )}
          </View>

          {/* Meta chips: time + location */}
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <MaterialIcons name="schedule" size={14} color={green.textDim} />
              <Text style={styles.chipText}>{time}</Text>
            </View>
            {log && (
              <View style={styles.chip}>
                <MaterialIcons name={TAG_ICON[log.tag]} size={14} color={green.textDim} />
                <Text style={styles.chipText}>{tagLabel}</Text>
              </View>
            )}
          </View>

          {/* Comment (only when present) */}
          {comment ? (
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>{s.comment}</Text>
              <Text style={styles.readonly}>{comment}</Text>
            </View>
          ) : null}

          {/* Diary (only when present) — tap to expand to the full text */}
          {diary ? (
            <Pressable style={styles.fieldCard} onPress={() => setExpanded((v) => !v)}>
              <View style={styles.fieldHead}>
                <Text style={styles.fieldLabel}>{s.diary}</Text>
                <View style={styles.expandHint}>
                  <Text style={styles.expandText}>{expanded ? s.showLess : s.readAll}</Text>
                  <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={16} color={green.green} />
                </View>
              </View>
              {expanded ? (
                <ScrollView style={styles.diaryScroll} nestedScrollEnabled>
                  <Text style={styles.readonly}>{diary}</Text>
                </ScrollView>
              ) : (
                <Text style={styles.readonly} numberOfLines={4}>
                  {diary}
                </Text>
              )}
            </Pressable>
          ) : null}

          {/* Copy / share all text */}
          {hasNotes && (
            <Pressable style={styles.copyBtn} onPress={copyAll}>
              <MaterialIcons name="content-copy" size={16} color={green.green} />
              <Text style={styles.copyText}>{s.copyText}</Text>
            </Pressable>
          )}

          {!editable && (
            <View style={styles.lockRow}>
              <MaterialIcons name="lock-outline" size={15} color={green.textDim} />
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

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
    card: { paddingHorizontal: spacing.xs, paddingBottom: spacing.xs, gap: spacing.md },
    header: { flexDirection: "row", alignItems: "center" },
    title: { color: green.text, fontSize: 20, fontFamily: fonts.bold, textAlign: textStart },
    time: { color: green.textDim, fontSize: 14, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: green.cardSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    chipRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: green.cardSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
    },
    chipText: { color: green.textSecondary, fontSize: 13, fontFamily: fonts.medium },

    fieldCard: {
      backgroundColor: green.cardSoft,
      borderRadius: radius.input,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    fieldHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    fieldLabel: { color: green.textDim, fontSize: 13, fontFamily: fonts.semibold, marginBottom: spacing.xs, textAlign: textStart },
    expandHint: { flexDirection: "row", alignItems: "center", gap: 2 },
    expandText: { color: green.green, fontSize: 12, fontFamily: fonts.semibold },
    readonly: { color: green.text, fontSize: 15, fontFamily: fonts.regular, lineHeight: 22, textAlign: textStart },
    diaryScroll: { maxHeight: 260 },

    copyBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor: green.cardSoft,
      borderRadius: radius.button,
      paddingVertical: 13,
    },
    copyText: { color: green.green, fontSize: 14, fontFamily: fonts.semibold },

    lockRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.xs },
    lockText: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular, flex: 1, textAlign: textStart },
    info: { color: green.textDim, fontSize: 16, fontFamily: fonts.regular },
  }),
);
