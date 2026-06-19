/**
 * Diary / History browser (the re-scoped Calendar tab, Hebrew "יומן").
 * Pick a day from the horizontal strip (or the month picker) and see that day's
 * cigarettes + diary + purchases together. Tap a cigarette row to open its
 * detail/edit sheet (editable only on today; past days are read-only). Logging a
 * cigarette is offered only while viewing today (logs are always stamped "now").
 *
 * Built from the Stitch reference, reconciled to our tokens + data model:
 * dropped its app/tab chrome, no separate "tag" field (comment shows inline; a
 * teal badge marks entries that have a diary note).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LogDetailSheet, LogDetailSheetRef } from "@/components/LogDetailSheet";
import { Ring } from "@/components/Ring";
import { isSameDay, keyOf } from "@/domain/day";
import {
  countForDay,
  limitForDay,
  logicalToday,
  logsForDay,
  purchasesForDay,
  spentForDay,
} from "@/domain/logic";
import { formatTime, formatWeekdayDate } from "@/i18n/format";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing } from "@/theme";

// Solid cards (glassmorphism removed): opaque surfaces with a hairline border.
const GLASS = colors.surface;
const GLASS_BORDER = colors.line;
const GLASS_TOP = colors.line;

export default function DiaryScreen() {
  const s = useStrings();
  const { logs, limits, purchases, settings } = useAppStore();
  const dsh = settings.dayStartHour;

  const today = logicalToday(dsh);
  const [selected, setSelected] = useState<Date>(today);
  const [focused, setFocused] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const detailRef = useRef<LogDetailSheetRef>(null);

  const cur = settings.currencySymbol;
  const money = (n: number) => `${cur}${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;

  const selLogs = logsForDay(logs, selected, dsh);
  const selPurchases = purchasesForDay(purchases, selected, dsh);
  const count = selLogs.length;
  const limit = limitForDay(limits, selected, settings);
  const within = count <= limit;
  const pct = limit === 0 ? 1 : Math.min(1, count / limit);
  const ringColor = within ? colors.ring : colors.bad;
  const spent = spentForDay(purchases, selected, dsh);
  const isToday = isSameDay(selected, today);

  const isRTL = I18nManager.isRTL;
  const prevArrow = isRTL ? "chevron-right" : "chevron-left";
  const nextArrow = isRTL ? "chevron-left" : "chevron-right";

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
  const atCurrentMonth =
    focused.getFullYear() === today.getFullYear() && focused.getMonth() === today.getMonth();
  const monthGridTitle = new Intl.DateTimeFormat(s.localeCode, { month: "long", year: "numeric" }).format(focused);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}
        alwaysBounceVertical
        overScrollMode="always"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{s.diaryTab}</Text>
        </View>

        {/* Month calendar */}
        <View style={styles.monthCard}>
          <View style={styles.monthHeader}>
            <Pressable
              onPress={() => setFocused(new Date(focused.getFullYear(), focused.getMonth() - 1, 1))}
              hitSlop={8}
            >
              <MaterialIcons name={prevArrow} size={22} color={colors.textDim} />
            </Pressable>
            <Text style={styles.monthGridTitle}>{monthGridTitle}</Text>
            <Pressable
              onPress={() => !atCurrentMonth && setFocused(new Date(focused.getFullYear(), focused.getMonth() + 1, 1))}
              hitSlop={8}
              disabled={atCurrentMonth}
            >
              <MaterialIcons name={nextArrow} size={22} color={atCurrentMonth ? colors.line : colors.textDim} />
            </Pressable>
          </View>
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((day, di) => {
                if (!day) return <View key={di} style={styles.cell} />;
                const future = keyOf(day) > today;
                const c = countForDay(logs, day, dsh);
                const lim = limitForDay(limits, day, settings);
                const sel = isSameDay(day, selected);
                return (
                  <Pressable
                    key={di}
                    style={styles.cell}
                    disabled={future}
                    onPress={() => {
                      setSelected(keyOf(day));
                      setFocused(new Date(day.getFullYear(), day.getMonth(), 1));
                    }}
                  >
                    <View
                      style={[
                        styles.dayBox,
                        sel && styles.dayBoxSelected,
                        !sel && c > 0 && styles.dayBoxHasDots,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          sel && styles.dayNumberSelected,
                          future && styles.dayNumberFuture,
                        ]}
                      >
                        {day.getDate()}
                      </Text>
                      {c > 0 && (
                        <View
                          style={[
                            styles.dayDot,
                            sel && styles.dayDotSelected,
                            !sel && c > lim && styles.dayDotOver,
                          ]}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Day summary */}
        <View style={styles.summary}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sumDate}>{formatWeekdayDate(selected, s.localeCode)}</Text>
            <Text style={[styles.sumCount, { color: ringColor }]}>
              {count} / {limit} {s.cigarettesSection.toLowerCase()}
            </Text>
          </View>
          <Ring size={56} strokeWidth={5} pct={pct} color={ringColor}>
            <Text style={styles.ringPct}>{Math.round(pct * 100)}%</Text>
          </Ring>
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <MaterialIcons name="attach-money" size={14} color={colors.textDim} />
            <Text style={styles.pillLabel}>{s.spentLabel}</Text>
            <Text style={styles.pillValue}>{money(spent)}</Text>
          </View>
          <View style={styles.pill}>
            <MaterialIcons name="smoking-rooms" size={14} color={colors.textDim} />
            <Text style={styles.pillValue}>{s.loggedN(count)}</Text>
          </View>
        </View>

        {/* Cigarettes */}
        <Text style={styles.section}>{s.cigarettesSection}</Text>
        {selLogs.length === 0 ? (
          <Text style={styles.empty}>{s.noLogsThisDay}</Text>
        ) : (
          [...selLogs].reverse().map((log, i) => (
            <Pressable
              key={log.id}
              style={styles.row}
              onPress={() => detailRef.current?.present({ log, number: count - i, editable: isToday })}
            >
              <View style={styles.rowIcon}>
                <MaterialIcons name="smoking-rooms" size={18} color={colors.textDim} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTitleLine}>
                  <Text style={styles.rowTitle}>{s.cigNumber(count - i)}</Text>
                  {!!log.diary && (
                    <View style={styles.diaryBadge}>
                      <MaterialIcons name="menu-book" size={11} color={colors.accent} />
                    </View>
                  )}
                </View>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {[formatTime(log.smokedAt), log.comment].filter(Boolean).join("  ·  ")}
                </Text>
              </View>
              <MaterialIcons name={isToday ? "edit" : "chevron-right"} size={isToday ? 14 : 20} color={colors.textDim} />
            </Pressable>
          ))
        )}

        {/* Purchases */}
        <Text style={styles.section}>{s.purchases}</Text>
        {selPurchases.length === 0 ? (
          <Text style={styles.empty}>{s.noPurchasesThisDay}</Text>
        ) : (
          selPurchases.map((p) => (
            <View key={p.id} style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name={p.unit === "carton" ? "inventory-2" : "receipt-long"} size={18} color={colors.textDim} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {p.quantity} {p.unit === "carton" ? s.carton : s.pack}
                </Text>
                <Text style={styles.rowSub}>{formatTime(p.boughtAt)}</Text>
              </View>
              <Text style={styles.price}>{money(p.price)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <LogDetailSheet ref={detailRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: 24, fontWeight: "800" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER, borderTopColor: GLASS_TOP,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: { borderColor: colors.accentBorder, backgroundColor: colors.accentTint },

  strip: { gap: spacing.sm, paddingVertical: spacing.xs, paddingRight: spacing.xs },
  chip: {
    width: 52,
    paddingVertical: spacing.md,
    borderRadius: radius.chip,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER, borderTopColor: GLASS_TOP,
    alignItems: "center",
    gap: 2,
  },
  chipSel: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipWd: { color: colors.textDim, fontSize: 11, fontWeight: "600" },
  chipNum: { color: colors.text, fontSize: 18, fontWeight: "800" },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, marginTop: 1 },

  monthCard: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  monthGridTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  weekRow: { flexDirection: "row" },
  cell: { flex: 1, aspectRatio: 1, padding: 2 },
  dayBox: {
    flex: 1,
    borderRadius: radius.card,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
    paddingVertical: 2,
  },
  dayBoxSelected: {
    backgroundColor: colors.accent,
    borderRadius: 999,
  },
  dayBoxHasDots: {
    backgroundColor: colors.fill,
  },
  dayNumber: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
  },
  dayNumberSelected: {
    color: colors.onAccent,
  },
  dayNumberFuture: {
    color: colors.line,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textDim,
    marginTop: 2,
  },
  dayDotSelected: {
    backgroundColor: colors.onAccent,
  },
  dayDotOver: {
    backgroundColor: colors.bad,
  },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  sumDate: { color: colors.text, fontSize: 18, fontWeight: "700" },
  sumCount: { fontSize: 15, fontWeight: "600", marginTop: spacing.xs },
  ringPct: { color: colors.text, fontSize: 13, fontWeight: "700" },
  pillRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
  },
  pillLabel: { color: colors.textDim, fontSize: 12 },
  pillValue: { color: colors.text, fontSize: 14, fontWeight: "700" },

  section: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: spacing.xxl, marginBottom: spacing.sm },
  empty: { color: colors.textDim, paddingVertical: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 0,
    paddingVertical: spacing.md,
    marginBottom: 0,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.fill, alignItems: "center", justifyContent: "center" },
  rowTitleLine: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowTitle: { color: colors.text, fontWeight: "700", fontSize: 15 },
  diaryBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  rowSub: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  price: { color: colors.text, fontWeight: "700", fontSize: 15 },

  logBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentTint,
    borderRadius: radius.button,
    paddingVertical: 14,
    marginTop: spacing.xs,
  },
  logBtnText: { color: colors.accent, fontWeight: "700", fontSize: 15 },
});
