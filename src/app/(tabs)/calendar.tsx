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
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddPurchaseSheet, AddPurchaseSheetRef } from "@/components/AddPurchaseSheet";
import { LogDetailSheet, LogDetailSheetRef } from "@/components/LogDetailSheet";
import { MonthPager } from "../../../packages/month-pager";
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
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";

// Solid cards (glassmorphism removed): opaque surfaces with a hairline border.
const GLASS = colors.surface;
const GLASS_BORDER = colors.line;
const GLASS_TOP = colors.line;

// Calendar grid for a given month, always padded to a fixed 6 weeks (42 cells)
// so every month has the same height — keeps the swipe between months smooth.
function buildWeeks(monthFirst: Date): (Date | null)[][] {
  const y = monthFirst.getFullYear();
  const m = monthFirst.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startWeekday = new Date(y, m, 1).getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
  while (cells.length < 42) cells.push(null);
  const out: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
  return out;
}

export default function DiaryScreen() {
  const s = useStrings();
  const router = useRouter();
  const { logs, limits, purchases, settings } = useAppStore();
  const dsh = settings.dayStartHour;

  const today = logicalToday(dsh);
  const [selected, setSelected] = useState<Date>(today);
  const [focused, setFocused] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const detailRef = useRef<LogDetailSheetRef>(null);
  const purchaseRef = useRef<AddPurchaseSheetRef>(null);

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

  const atCurrentMonth =
    focused.getFullYear() === today.getFullYear() && focused.getMonth() === today.getMonth();
  const monthGridTitle = new Intl.DateTimeFormat(s.localeCode, { month: "long", year: "numeric" }).format(focused);

  // Renders one month's grid; reused by MonthPager for prev / current / next.
  const renderMonth = (monthFirst: Date) =>
    buildWeeks(monthFirst).map((week, wi) => (
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
    ));

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
          <MonthPager
            focused={focused}
            onChange={(next) => {
              Haptics.selectionAsync();
              setFocused(next);
            }}
            renderMonth={renderMonth}
            canGoNext={!atCurrentMonth}
            isRTL={isRTL}
          />
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
        <View style={styles.sectionRow}>
          <Text style={[styles.section, { marginTop: 0, marginBottom: 0 }]}>{s.purchases}</Text>
          {purchases.length > 0 && (
            <Pressable style={styles.viewAll} onPress={() => router.push("/purchases")} hitSlop={8}>
              <Text style={styles.viewAllText}>{s.viewAll}</Text>
              <MaterialIcons name={nextArrow} size={16} color={colors.accent} />
            </Pressable>
          )}
        </View>
        {selPurchases.length === 0 ? (
          <Text style={styles.empty}>{s.noPurchasesThisDay}</Text>
        ) : (
          selPurchases.map((p) => (
            <Pressable key={p.id} style={styles.row} onPress={() => purchaseRef.current?.present(p)}>
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
              <MaterialIcons name="edit" size={14} color={colors.textDim} style={{ marginStart: spacing.sm }} />
            </Pressable>
          ))
        )}
      </ScrollView>

      <LogDetailSheet ref={detailRef} />
      <AddPurchaseSheet ref={purchaseRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: 24, fontFamily: fonts.bold, textAlign: textStart },
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
  chipWd: { color: colors.textDim, fontSize: 11, fontFamily: fonts.semibold },
  chipNum: { color: colors.text, fontSize: 18, fontFamily: fonts.monoSemibold },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, marginTop: 1 },

  monthCard: {
    paddingVertical: spacing.sm,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  monthGridTitle: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
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
    fontFamily: fonts.semibold,
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
  sumDate: { color: colors.text, fontSize: 18, fontFamily: fonts.bold, textAlign: textStart },
  sumCount: { fontSize: 15, fontFamily: fonts.semibold, marginTop: spacing.xs, textAlign: textStart },
  ringPct: { color: colors.text, fontSize: 13, fontFamily: fonts.monoMedium },
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
  pillLabel: { color: colors.textDim, fontSize: 12, fontFamily: fonts.regular },
  pillValue: { color: colors.text, fontSize: 14, fontFamily: fonts.bold },

  section: {
    color: colors.textDim,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: fonts.medium,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
    textAlign: textStart,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewAllText: { color: colors.accent, fontSize: 13, fontFamily: fonts.bold },
  empty: { color: colors.textDim, fontFamily: fonts.regular, paddingVertical: spacing.md, textAlign: textStart },
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
  rowTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  diaryBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  rowSub: { color: colors.textDim, fontSize: 13, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },
  price: { color: colors.text, fontFamily: fonts.monoMedium, fontSize: 15 },

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
  logBtnText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 15 },
});
