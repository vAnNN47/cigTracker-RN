/**
 * Calendar screen — ported from lib/screens/calendar_screen.dart.
 * Month grid (custom, no lib) with per-day counts colored vs the day's limit,
 * a selected-day section (count/limit chip, logs, purchases), and a locked
 * notice for past days (diary is only editable on Today).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addDays, isSameDay, keyOf, today as todayKey } from "@/domain/day";
import {
  countForDay,
  limitForDay,
  logicalToday,
  logsForDay,
  purchasesForDay,
} from "@/domain/logic";
import { formatTime, formatWeekdayDate } from "@/i18n/format";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing, type } from "@/theme";

const GOOD_SOFT = "rgba(108,229,177,0.18)";
const BAD_SOFT = "rgba(255,122,122,0.18)";
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarScreen() {
  const s = useStrings();
  const { logs, limits, purchases, settings } = useAppStore();
  const dsh = settings.dayStartHour;

  const today = logicalToday(dsh);
  const [focused, setFocused] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);

  const monthEnd = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const atCurrentMonth =
    focused.getFullYear() === monthEnd.getFullYear() && focused.getMonth() === monthEnd.getMonth();
  const atFirstMonth = focused.getFullYear() <= 2023 && focused.getMonth() === 0;

  // Build the month grid as weeks of 7 (null = padding day).
  const weeks = useMemo(() => {
    const y = focused.getFullYear();
    const m = focused.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const startWeekday = new Date(y, m, 1).getDay();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const out: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [focused]);

  const monthTitle = new Intl.DateTimeFormat(s.localeCode, {
    month: "long",
    year: "numeric",
  }).format(focused);

  const selLogs = logsForDay(logs, selected, dsh);
  const selPurchases = purchasesForDay(purchases, selected, dsh);
  const selCount = selLogs.length;
  const selLimit = limitForDay(limits, selected, settings);
  const isToday = isSameDay(selected, today);
  const cur = settings.currencySymbol;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        paddingTop: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
      }}
      alwaysBounceVertical={false}
      overScrollMode="never"
    >
      <Text style={styles.title}>{s.calendar}</Text>

      {/* Month card */}
      <View style={styles.card}>
        <View style={styles.monthHeader}>
          <Pressable
            onPress={() => !atFirstMonth && setFocused(new Date(focused.getFullYear(), focused.getMonth() - 1, 1))}
            hitSlop={8}
            disabled={atFirstMonth}
          >
            <MaterialIcons name="chevron-left" size={26} color={atFirstMonth ? colors.line : colors.text} />
          </Pressable>
          <Text style={styles.monthTitle}>{monthTitle}</Text>
          <Pressable
            onPress={() => !atCurrentMonth && setFocused(new Date(focused.getFullYear(), focused.getMonth() + 1, 1))}
            hitSlop={8}
            disabled={atCurrentMonth}
          >
            <MaterialIcons name="chevron-right" size={26} color={atCurrentMonth ? colors.line : colors.text} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((w) => (
            <Text key={w} style={styles.weekday}>
              {w}
            </Text>
          ))}
        </View>

        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day, di) => {
              if (!day) return <View key={di} style={styles.cell} />;
              const isFuture = keyOf(day) > today;
              const count = countForDay(logs, day, dsh);
              const limit = limitForDay(limits, day, settings);
              const within = count <= limit;
              const has = count > 0;
              const isSel = isSameDay(day, selected);
              const isTod = isSameDay(day, today);

              const cellBg = isSel ? colors.accent : has ? (within ? GOOD_SOFT : BAD_SOFT) : "transparent";
              const numColor = isSel ? colors.bg : isFuture ? colors.line : colors.text;
              const countColor = isSel ? colors.bg : within ? colors.good : colors.bad;

              return (
                <Pressable
                  key={di}
                  style={styles.cell}
                  disabled={isFuture}
                  onPress={() => setSelected(keyOf(day))}
                >
                  <View
                    style={[
                      styles.dayBox,
                      { backgroundColor: cellBg },
                      isTod && !isSel ? styles.todayBorder : null,
                    ]}
                  >
                    <Text style={[styles.dayNum, { color: numColor }]}>{day.getDate()}</Text>
                    {has && <Text style={[styles.dayCount, { color: countColor }]}>{count}</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Selected day header */}
      <View style={styles.selHeader}>
        <Text style={styles.selDate}>{formatWeekdayDate(selected, s.localeCode)}</Text>
        <View style={[styles.chip, { backgroundColor: selCount <= selLimit ? GOOD_SOFT : BAD_SOFT }]}>
          <Text style={{ color: selCount <= selLimit ? colors.good : colors.bad, fontWeight: "600" }}>
            {selCount} / {selLimit}
          </Text>
        </View>
      </View>

      {!isToday && (
        <View style={styles.lockRow}>
          <MaterialIcons name="lock-outline" size={15} color={colors.textDim} />
          <Text style={styles.lockText}>{s.pastLocked}</Text>
        </View>
      )}

      {/* Logs (newest first) */}
      {selLogs.length === 0 ? (
        <Text style={styles.empty}>{s.noLogsThisDay}</Text>
      ) : (
        [...selLogs].reverse().map((l) => {
          const sub = [l.comment, l.diary].filter(Boolean);
          return (
            <View key={l.id} style={styles.row}>
              <Text style={styles.time}>{formatTime(l.smokedAt)}</Text>
              <View style={styles.rowText}>
                {l.comment ? <Text style={styles.comment}>{l.comment}</Text> : null}
                {l.diary ? <Text style={styles.diary}>{l.diary}</Text> : null}
                {sub.length === 0 ? <Text style={styles.dash}>—</Text> : null}
              </View>
            </View>
          );
        })
      )}

      {/* Purchases */}
      <Text style={styles.section}>{s.purchases}</Text>
      {selPurchases.length === 0 ? (
        <Text style={styles.empty}>{s.noPurchasesThisDay}</Text>
      ) : (
        selPurchases.map((p) => (
          <View key={p.id} style={styles.row}>
            <MaterialIcons
              name={p.unit === "carton" ? "inventory-2" : "local-mall"}
              size={20}
              color={colors.textDim}
            />
            <Text style={styles.rowText}>
              {p.quantity} {p.unit === "carton" ? s.carton : s.pack}
            </Text>
            <Text style={styles.price}>
              {cur}
              {p.price.toFixed(0)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: spacing.sm, marginLeft: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.sm,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  monthTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  weekRow: { flexDirection: "row" },
  weekday: { flex: 1, textAlign: "center", color: colors.textDim, fontSize: 12, paddingVertical: spacing.xs },
  cell: { flex: 1, aspectRatio: 1, padding: 3 },
  dayBox: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  todayBorder: { borderWidth: 1.4, borderColor: colors.accent },
  dayNum: { fontWeight: "600", fontSize: 13 },
  dayCount: { fontSize: 10, marginTop: 1 },
  selHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  selDate: { color: colors.text, fontSize: 16, fontWeight: "600" },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 20 },
  lockRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  lockText: { color: colors.textDim, fontSize: 12, flex: 1 },
  empty: { color: colors.textDim, paddingVertical: spacing.md },
  section: { color: colors.text, fontSize: 16, fontWeight: "600", marginTop: spacing.lg, marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  rowText: { flex: 1 },
  time: { color: colors.text, fontWeight: "600" },
  comment: { color: colors.text, fontSize: 13 },
  diary: { color: colors.textDim, fontSize: 13, fontStyle: "italic", marginTop: 2 },
  dash: { color: colors.textDim },
  price: { color: colors.text, fontWeight: "600" },
});
