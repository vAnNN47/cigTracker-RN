/**
 * Today — "haze" redesign.
 * Persistent header (brand + supportive subline + streak), a hero ring with
 * status copy, quick actions (Log one / Buy), a month money strip
 * (spent / saved / avg per day), and a Recent list.
 *
 * Status color follows count vs allowance: under = periwinkle, at = amber,
 * over = red. Copy stays supportive even when over.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddPurchaseSheet, AddPurchaseSheetRef } from "@/components/AddPurchaseSheet";
import { AddSmokeSheet, AddSmokeSheetRef } from "@/components/AddSmokeSheet";
import { LogDetailSheet, LogDetailSheetRef } from "@/components/LogDetailSheet";
import { Ring } from "@/components/Ring";
import { useToast } from "@/components/Toast";
import { currentLimit, currentStreak, isLogEditable, logicalDay, logicalToday, logsForDay } from "@/domain/logic";
import { formatTime } from "@/i18n/format";
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { SmokeLog } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, spacing } from "@/theme";

export default function TodayScreen() {
  const s = useStrings();
  const toast = useToast();
  const router = useRouter();

  const { logs, limits, purchases, settings } = useAppStore();
  const deleteLog = useAppStore((st) => st.deleteLog);
  const refresh = useAppStore((st) => st.refresh);

  const addRef = useRef<AddSmokeSheetRef>(null);
  const purchaseRef = useRef<AddPurchaseSheetRef>(null);
  const detailRef = useRef<LogDetailSheetRef>(null);

  const dsh = settings.dayStartHour;
  const todayKey = logicalToday(dsh);
  const count = logsForDay(logs, todayKey, dsh).length;
  const limit = currentLimit(limits, settings);
  const streak = currentStreak(logs, limits, settings);

  const status = count > limit ? "over" : count === limit ? "at" : "under";
  const statusColor =
    status === "over" ? colors.over : status === "at" ? colors.atLimit : colors.under;
  const statusLine =
    status === "over" ? s.statusOverLine : status === "at" ? s.statusAtLine : s.statusUnderLine;
  const subText = status === "over" ? s.subOver : status === "at" ? s.subAt : s.subUnder;
  const pct = limit > 0 ? Math.min(1, count / limit) : count > 0 ? 1 : 0;

  // Month money strip.
  const cur = settings.currencySymbol;
  const money = (n: number) => `${cur}${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;
  const now = new Date();
  const inMonth = (d: Date) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  const spentMonth = purchases.filter((p) => inMonth(p.boughtAt)).reduce((a, p) => a + p.price, 0);
  const monthLogs = logs.filter((l) => inMonth(l.smokedAt)).length;
  const daysElapsed = now.getDate();
  const avg = daysElapsed > 0 ? monthLogs / daysElapsed : 0;
  const wouldHave = (settings.baselinePerDay * daysElapsed / 20) * settings.pricePerPack;
  const savedMonth = Math.max(0, Math.round(wouldHave - spentMonth));

  const recent = [...logs].sort((a, b) => b.smokedAt.getTime() - a.smokedAt.getTime()).slice(0, 3);

  // A cigarette's ordinal within its own logical day (1-based), so "Recently"
  // opens the detail sheet on the right number instead of #0.
  const numberOf = (log: SmokeLog) => {
    const dayLogs = logsForDay(logs, logicalDay(log.smokedAt, dsh), dsh);
    return dayLogs.findIndex((l) => l.id === log.id) + 1;
  };

  const onLogged = (log: SmokeLog) => {
    toast.show({ message: s.loggedToast, actionLabel: s.undo, onAction: () => deleteLog(log.id) });
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <RefreshScroll onRefresh={refresh}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.wordmark}>{s.appTitle}</Text>
            </View>
            <Text style={styles.subline}>{s.todaySub}</Text>
          </View>
          <View>
            <Text style={styles.streakCap}>{s.dayStreak}</Text>
            <Text style={styles.streakVal}>{streak}</Text>
          </View>
        </View>

        {/* Hero ring */}
        <View style={styles.hero}>
          <Ring size={124} strokeWidth={9} pct={pct} color={statusColor}>
            <Text style={[styles.heroCount, { color: statusColor }]}>{count}</Text>
            <Text style={styles.heroOf}>{s.ofN(limit)}</Text>
          </Ring>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{s.today}</Text>
            <Text style={[styles.statusLine, { color: statusColor }]}>{statusLine}</Text>
            <Text style={styles.subText}>{subText}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={() => addRef.current?.present()}>
            <MaterialIcons name="add" size={20} color={colors.onAccent} />
            <Text style={styles.primaryText}>{s.logOne}</Text>
          </Pressable>
          <Pressable style={styles.secondaryBtn} onPress={() => purchaseRef.current?.present()}>
            <MaterialIcons name="work-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.secondaryText}>{s.buy}</Text>
          </Pressable>
        </View>

        {/* Money strip */}
        <View style={styles.strip}>
          <View style={styles.stripCell}>
            <Text style={styles.stripLabel}>{`${s.spentLabel} · ${s.thisMonth}`}</Text>
            <Text style={styles.stripVal}>{money(spentMonth)}</Text>
          </View>
          <View style={[styles.stripCell, styles.stripDivider]}>
            <Text style={styles.stripLabel}>{`${s.savedShort} · ${s.thisMonth}`}</Text>
            <Text style={[styles.stripVal, { color: colors.accent }]}>{money(savedMonth)}</Text>
          </View>
          <View style={[styles.stripCell, styles.stripDivider]}>
            <Text style={styles.stripLabel}>{s.avgPerDay}</Text>
            <Text style={styles.stripVal}>{avg.toFixed(1)}</Text>
          </View>
        </View>

        {/* Recent */}
        <Text style={styles.recentLabel}>{s.recent}</Text>
        {recent.length === 0 ? (
          <Text style={styles.empty}>{s.nothingToday}</Text>
        ) : (
          recent.map((log) => {
            const sub = [formatTime(log.smokedAt), log.comment || log.diary].filter(Boolean).join("  ·  ");
            return (
              <Pressable
                key={log.id}
                style={styles.row}
                onPress={() =>
                  detailRef.current?.present({ log, number: numberOf(log), editable: isLogEditable(log, dsh) })
                }
              >
                <View style={styles.rowDot} />
                <Text style={styles.rowText} numberOfLines={1}>
                  {sub || s.cigarettesSection}
                </Text>
                <MaterialIcons name="chevron-right" size={18} color={colors.textFaint} />
              </Pressable>
            );
          })
        )}
      </RefreshScroll>

      <AddSmokeSheet ref={addRef} onLogged={onLogged} />
      <AddPurchaseSheet ref={purchaseRef} />
      <LogDetailSheet ref={detailRef} />
    </SafeAreaView>
  );
}

// Native iOS scroll: rubber-band overscroll (alwaysBounceVertical) + the system
// pull-to-refresh, which carries the proper bounce feel.
function RefreshScroll({ children, onRefresh }: { children: React.ReactNode; onRefresh: () => void | Promise<void> }) {
  const [refreshing, setRefreshing] = useState(false);
  const handle = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: spacing.sm, paddingHorizontal: 22, paddingBottom: spacing.xxl }}
      alwaysBounceVertical
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handle}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 28 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  wordmark: { color: colors.text, fontSize: 19, fontFamily: fonts.bold, letterSpacing: -0.4 },
  subline: { color: colors.textDim, fontSize: 12, marginTop: 5, fontFamily: fonts.regular, textAlign: textStart },
  streakCap: { color: colors.textDim, fontSize: 11, fontFamily: fonts.regular, textAlign: textStart },
  streakVal: { color: colors.accent, fontSize: 14, fontFamily: fonts.monoMedium, marginTop: 2, textAlign: textStart },

  hero: { flexDirection: "row", alignItems: "center", gap: 22, marginBottom: 30 },
  heroCount: { fontSize: 38, fontFamily: fonts.monoSemibold, lineHeight: 42 },
  heroOf: { color: colors.textFaint, fontSize: 11, fontFamily: fonts.mono, marginTop: 3 },
  eyebrow: {
    color: colors.textDim,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    fontFamily: fonts.medium,
    textAlign: textStart,
  },
  statusLine: { fontSize: 16, fontFamily: fonts.semibold, marginBottom: 6, textAlign: textStart },
  subText: { color: colors.textDim, fontSize: 13, lineHeight: 20, fontFamily: fonts.regular, textAlign: textStart },

  actions: { flexDirection: "row", gap: 10, marginBottom: 26 },
  primaryBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
  },
  primaryText: { color: colors.onAccent, fontSize: 15, fontFamily: fonts.semibold },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: 16,
  },
  secondaryText: { color: colors.textSecondary, fontSize: 15, fontFamily: fonts.semibold },

  strip: { flexDirection: "row", marginBottom: 30 },
  stripCell: { flex: 1, paddingHorizontal: spacing.sm },
  stripDivider: { borderLeftWidth: 1, borderLeftColor: colors.line },
  stripLabel: { color: colors.textDim, fontSize: 11, fontFamily: fonts.regular, textAlign: textStart },
  stripVal: { color: colors.text, fontSize: 21, fontFamily: fonts.monoMedium, marginTop: 6, textAlign: textStart },

  recentLabel: { color: colors.textDim, fontSize: 13, fontFamily: fonts.medium, marginBottom: spacing.sm, textAlign: textStart },
  empty: { color: colors.textFaint, fontSize: 13, paddingVertical: spacing.md, fontFamily: fonts.regular, textAlign: textStart },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  rowText: { flex: 1, color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular, textAlign: textStart },
});
