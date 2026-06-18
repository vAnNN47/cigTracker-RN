/**
 * Today screen — ported from lib/screens/home_screen.dart.
 * Count-vs-limit ring, Add cigarette / Add purchase, today's log list with
 * long-press to edit (no delete). (Pull-to-refresh returns with Supabase sync.)
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddSmokeSheet, AddSmokeSheetRef } from "@/components/AddSmokeSheet";
import { EditLogSheet, EditLogSheetRef } from "@/components/EditLogSheet";
import { Ring } from "@/components/Ring";
import { RefreshableScrollView } from "../../../packages/pull-refresh";
import { useToast } from "@/components/Toast";
import { currentLimit, isLogEditable, logicalToday, logsForDay } from "@/domain/logic";
import { formatTime, formatWeekdayDate } from "@/i18n/format";
import { useStrings } from "@/i18n/useStrings";
import { SmokeLog } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, type } from "@/theme";

export default function TodayScreen() {
  const s = useStrings();
  const toast = useToast();

  const { logs, limits, settings } = useAppStore();
  const deleteLog = useAppStore((st) => st.deleteLog);
  const refresh = useAppStore((st) => st.refresh);

  const addRef = useRef<AddSmokeSheetRef>(null);
  const editRef = useRef<EditLogSheetRef>(null);

  const todayKey = logicalToday(settings.dayStartHour);
  const todayLogs = logsForDay(logs, todayKey, settings.dayStartHour);
  const count = todayLogs.length;
  const limit = currentLimit(limits, settings);
  const within = count <= limit;
  const pct = limit === 0 ? 1 : Math.min(1, count / limit);
  const color = within ? colors.good : colors.bad;

  const onLogged = (log: SmokeLog) => {
    toast.show({
      message: s.loggedToast,
      actionLabel: s.undo,
      onAction: () => deleteLog(log.id),
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <RefreshableScrollView
        onRefresh={refresh}
        threshold={70}
        resistance={0.8}
        spinnerColor={colors.accent}
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xxl,
        }}
      >
        <Text style={styles.date}>{formatWeekdayDate(todayKey, s.localeCode)}</Text>

        {/* Today card */}
        <View style={styles.card}>
          <Ring pct={pct} color={color}>
            <Text style={styles.count}>{count}</Text>
          </Ring>
          <View style={styles.cardText}>
            <Text style={styles.ofToday}>{s.ofToday(limit)}</Text>
            <Text style={[styles.status, { color }]}>
              {within ? s.leftInBudget(Math.max(0, limit - count)) : s.overLimit(count - limit)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <Pressable style={styles.primaryBtn} onPress={() => addRef.current?.present()}>
          <MaterialIcons name="add" size={20} color={colors.onAccent} />
          <Text style={styles.primaryText}>{s.addCigarette}</Text>
        </Pressable>
        <Pressable
          style={styles.outlineBtn}
          onPress={() => toast.show({ message: "Purchases arrive with the number pad (Step 8)." })}
        >
          <MaterialIcons name="shopping-bag" size={20} color={colors.accent} />
          <Text style={styles.outlineText}>{s.addPurchase}</Text>
        </Pressable>

        {/* Today's log list */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{s.today}</Text>
          <Text style={styles.dim}>
            {todayLogs.length} {s.loggedCount}
          </Text>
        </View>

        {todayLogs.length === 0 ? (
          <Text style={styles.empty}>{s.nothingToday}</Text>
        ) : (
          [...todayLogs].reverse().map((log) => {
            const editable = isLogEditable(log, settings.dayStartHour);
            const subtitle = [log.comment, log.diary].filter(Boolean).join("  ·  ");
            return (
              <Pressable
                key={log.id}
                style={styles.tile}
                onLongPress={() => editable && editRef.current?.present(log)}
                delayLongPress={300}
              >
                <MaterialIcons name="smoking-rooms" size={20} color={colors.textDim} />
                <View style={styles.tileText}>
                  <Text style={styles.time}>{formatTime(log.smokedAt)}</Text>
                  {!!subtitle && (
                    <Text style={styles.subtitle} numberOfLines={2}>
                      {subtitle}
                    </Text>
                  )}
                </View>
                {editable && <MaterialIcons name="edit" size={16} color={colors.textDim} />}
              </Pressable>
            );
          })
        )}
      </RefreshableScrollView>

      <AddSmokeSheet ref={addRef} onLogged={onLogged} />
      <EditLogSheet ref={editRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  date: { color: colors.textDim, fontSize: 14, marginBottom: spacing.lg },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  count: { color: colors.text, fontSize: 28, fontWeight: "700" },
  cardText: { flex: 1, gap: spacing.xs },
  ofToday: { color: colors.textDim, fontSize: 16 },
  status: { fontWeight: "600" },
  primaryBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingVertical: 14,
    marginTop: spacing.xl,
  },
  primaryText: { color: colors.onAccent, fontWeight: "600", fontSize: type.body.fontSize },
  outlineBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.button,
    paddingVertical: 14,
    marginTop: spacing.sm,
  },
  outlineText: { color: colors.accent, fontWeight: "600", fontSize: type.body.fontSize },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xxl + spacing.xs,
    marginBottom: spacing.sm,
  },
  listTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  dim: { color: colors.textDim, fontSize: type.label.fontSize },
  empty: { color: colors.textDim, textAlign: "center", paddingVertical: spacing.xxl },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  tileText: { flex: 1 },
  time: { color: colors.text, fontWeight: "600" },
  subtitle: { color: colors.textDim, fontSize: 13, marginTop: 2 },
});
