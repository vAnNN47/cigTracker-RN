/**
 * Tap-to-open log detail sheet (read-only), light/dark themed. Shows the entry's
 * number, time, location and notes. Behaviour:
 *  - Empty fields are hidden (no "—" placeholder) so a note-less entry stays
 *    compact (task: don't show an empty diary).
 *  - A long diary is collapsed to a few lines with a "read all" toggle; expanded
 *    it scrolls inside a capped height so the sheet never runs off-screen
 *    (task: tap to open the full text / expand to show everything).
 *  - "Copy text" copies the entry's notes (comment + diary) straight to the
 *    clipboard and shows a "Copied" toast — no OS share sheet (task: copy all text).
 * When the log is editable (today) a pencil opens the full-screen edit modal.
 *
 * Imperative API: parent calls ref.present({ log, number, editable }).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Alert } from "react-native";

import { useToast } from "@/components/feedback/Toast";
import { formatTime } from "@/i18n/format";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { copyToClipboard } from "@/lib/clipboard";
import { LocationTag, SmokeLog } from "@/models";
import { radius, useColors } from "@/theme";
import { Pressable, ScrollView, Text, View } from "@/tw";

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

/** Read-only log detail bottom sheet; opened imperatively via ref.present(). */
export const LogDetailSheet = forwardRef<LogDetailSheetRef, object>(
  function LogDetailSheet(_props, ref) {
    const s = useStrings();
    const green = useColors();
    const router = useRouter();
    const toast = useToast();
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
      const parts: string[] = [];
      if (comment) parts.push(comment);
      if (diary) parts.push(diary);
      void copyToClipboard(parts.join("\n\n")).then((ok) => {
        if (ok) toast.show({ message: s.copiedToast });
      });
    };

    return (
      <KeyboardSheet
        ref={sheetRef}
        dismissMode="swipe"
        backgroundColor={green.bg}
        handleColor={green.border}
        cornerRadius={radius.sheet}
      >
        <View className="px-1 pb-1 gap-3">
          <View className="flex-row items-center">
            <View className="flex-1">
              <Text className="text-text text-[20px] font-bold" style={{ textAlign: textStart }}>{s.cigNumber(number)}</Text>
              <Text className="text-text-dim text-[14px] font-regular mt-0.5" style={{ textAlign: textStart }}>{time}</Text>
            </View>
            {editable && (
              <Pressable className="w-[38px] h-[38px] rounded-[19px] bg-card-soft items-center justify-center" onPress={openEdit} hitSlop={8}>
                <MaterialIcons name="edit" size={18} color={green.green} />
              </Pressable>
            )}
          </View>

          {/* Meta chips: time + location */}
          <View className="flex-row gap-2 flex-wrap">
            <View className="flex-row items-center gap-1.5 bg-card-soft rounded-pill px-3 py-[7px]">
              <MaterialIcons name="schedule" size={14} color={green.textDim} />
              <Text className="text-text-secondary text-[13px] font-medium">{time}</Text>
            </View>
            {log && (
              <View className="flex-row items-center gap-1.5 bg-card-soft rounded-pill px-3 py-[7px]">
                <MaterialIcons name={TAG_ICON[log.tag]} size={14} color={green.textDim} />
                <Text className="text-text-secondary text-[13px] font-medium">{tagLabel}</Text>
              </View>
            )}
          </View>

          {/* Comment (only when present) */}
          {comment ? (
            <View className="bg-card-soft rounded-input px-3 py-3">
              <Text className="text-text-dim text-[13px] font-semibold mb-1" style={{ textAlign: textStart }}>{s.comment}</Text>
              <Text className="text-text text-[15px] font-regular leading-[22px]" style={{ textAlign: textStart }}>{comment}</Text>
            </View>
          ) : null}

          {/* Diary (only when present) — tap to expand to the full text */}
          {diary ? (
            <Pressable className="bg-card-soft rounded-input px-3 py-3" onPress={() => setExpanded((v) => !v)}>
              <View className="flex-row items-center justify-between">
                <Text className="text-text-dim text-[13px] font-semibold mb-1" style={{ textAlign: textStart }}>{s.diary}</Text>
                <View className="flex-row items-center gap-0.5">
                  <Text className="text-green text-[12px] font-semibold">{expanded ? s.showLess : s.readAll}</Text>
                  <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={16} color={green.green} />
                </View>
              </View>
              {expanded ? (
                <ScrollView className="max-h-[260px]" nestedScrollEnabled>
                  <Text className="text-text text-[15px] font-regular leading-[22px]" style={{ textAlign: textStart }}>{diary}</Text>
                </ScrollView>
              ) : (
                <Text className="text-text text-[15px] font-regular leading-[22px]" style={{ textAlign: textStart }} numberOfLines={4}>
                  {diary}
                </Text>
              )}
            </Pressable>
          ) : null}

          {/* Copy / share all text */}
          {hasNotes && (
            <Pressable className="flex-row items-center justify-center gap-2 bg-card-soft rounded-button py-[13px]" onPress={copyAll}>
              <MaterialIcons name="content-copy" size={16} color={green.green} />
              <Text className="text-green text-[14px] font-semibold">{s.copyText}</Text>
            </Pressable>
          )}

          {!editable && (
            <View className="flex-row items-center gap-1.5 mt-1">
              <MaterialIcons name="lock-outline" size={15} color={green.textDim} />
              <Text className="text-text-dim text-[12px] font-regular flex-1" style={{ textAlign: textStart }}>{s.pastLocked}</Text>
              <Pressable onPress={() => Alert.alert(s.whyLockTitle, s.whyLockBody)} hitSlop={8}>
                <Text className="text-text-dim text-[16px] font-regular">ⓘ</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardSheet>
    );
  },
);
