/**
 * History — color-coded calendar (design handoff). Each day cell shows that
 * day's count, tinted by status: under/at allowance = periwinkle, over = red, no
 * logs = faint. A weekday header tops the grid; a month tally (days under / days
 * over / month total) sits below. Tapping a day opens its detail underneath —
 * that day's cigarettes (editable only on today) + purchases — which we keep on
 * top of the handoff's browse view so logs stay reachable for editing.
 */
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddPurchaseSheet, AddPurchaseSheetRef } from "@/components/AddPurchaseSheet";
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
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { LocationTag } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, radius, spacing } from "@/theme";
import { MonthPager } from "../../../packages/month-pager";

// Per-cigarette location icon (design handoff: Home / Work / Car / Social).
const TAG_ICON: Record<LocationTag, keyof typeof MaterialIcons.glyphMap> = {
  home: "home",
  work: "work-outline",
  car: "directions-car",
  social: "groups",
};

// Status tints not in the token set (the under-tints reuse the accent tokens).
const OVER_BG = "rgba(224,138,138,0.16)";
const OVER_BORDER = "rgba(224,138,138,0.35)";

// Calendar grid for a month, padded to a fixed 6 weeks (42 cells) so every month
// is the same height — keeps the swipe between months smooth.
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

export default function HistoryScreen() {
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

  // Locale-aware narrow weekday headers, Sunday-first (Jan 1 2023 was a Sunday).
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(s.localeCode, { weekday: "narrow" }).format(new Date(2023, 0, 1 + i)),
  );

  // Month tally over elapsed days of the focused month.
  let daysUnder = 0;
  let daysOver = 0;
  let monthTotal = 0;
  {
    const y = focused.getFullYear();
    const m = focused.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) {
      const day = new Date(y, m, d);
      if (keyOf(day) > today) break;
      const c = countForDay(logs, day, dsh);
      const lim = limitForDay(limits, day, settings);
      monthTotal += c;
      if (c > lim) daysOver += 1;
      else daysUnder += 1;
    }
  }

  // One month's grid; reused by MonthPager for prev / current / next.
  const renderMonth = (monthFirst: Date) =>
    buildWeeks(monthFirst).map((week, wi) => (
      <View key={wi} style={styles.weekRow}>
        {week.map((day, di) => {
          if (!day) return <View key={di} style={styles.cell} />;
          const future = keyOf(day) > today;
          const c = countForDay(logs, day, dsh);
          const lim = limitForDay(limits, day, settings);
          const sel = isSameDay(day, selected);
          const isTodayCell = isSameDay(day, today);
          const status = future ? "future" : c === 0 ? "none" : c <= lim ? "under" : "over";
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
                  status === "under" && styles.dayUnder,
                  status === "over" && styles.dayOver,
                  status === "none" && styles.dayNone,
                  isTodayCell && styles.dayToday,
                  sel && !isTodayCell && styles.daySelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayNum,
                    status === "under" && styles.dayNumUnder,
                    status === "over" && styles.dayNumOver,
                    (status === "none" || status === "future") && styles.dayNumFaint,
                  ]}
                >
                  {day.getDate()}
                </Text>
                {!future && c > 0 && (
                  <Text style={[styles.dayCount, status === "over" ? styles.dayCountOver : styles.dayCountUnder]}>
                    {c}
                  </Text>
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
        <Text style={styles.title}>{s.diaryTab}</Text>

        {/* Month nav */}
        <View style={styles.monthHeader}>
          <Pressable
            onPress={() => setFocused(new Date(focused.getFullYear(), focused.getMonth() - 1, 1))}
            hitSlop={8}
            style={styles.navBtn}
          >
            <MaterialIcons name={prevArrow} size={20} color={colors.textDim} />
          </Pressable>
          <Text style={styles.monthGridTitle}>{monthGridTitle}</Text>
          <Pressable
            onPress={() => !atCurrentMonth && setFocused(new Date(focused.getFullYear(), focused.getMonth() + 1, 1))}
            hitSlop={8}
            disabled={atCurrentMonth}
            style={styles.navBtn}
          >
            <MaterialIcons name={nextArrow} size={20} color={atCurrentMonth ? colors.line : colors.textDim} />
          </Pressable>
        </View>

        {/* Weekday header */}
        <View style={styles.weekdayRow}>
          {weekdays.map((w, i) => (
            <Text key={i} style={styles.weekday}>
              {w}
            </Text>
          ))}
        </View>

        {/* Calendar */}
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

        {/* Month tally */}
        <View style={styles.tally}>
          <View style={styles.tallyCell}>
            <Text style={[styles.tallyVal, { color: colors.accent }]}>{daysUnder}</Text>
            <Text style={styles.tallyLabel}>{s.daysUnder}</Text>
          </View>
          <View style={[styles.tallyCell, styles.tallyDivider]}>
            <Text style={[styles.tallyVal, { color: colors.overText }]}>{daysOver}</Text>
            <Text style={styles.tallyLabel}>{s.daysOver}</Text>
          </View>
          <View style={[styles.tallyCell, styles.tallyDivider]}>
            <Text style={styles.tallyVal}>{monthTotal}</Text>
            <Text style={styles.tallyLabel}>{s.monthTotal}</Text>
          </View>
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
                <MaterialIcons name={TAG_ICON[log.tag]} size={18} color={colors.textDim} />
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
  title: { color: colors.text, fontSize: 24, fontFamily: fonts.bold, textAlign: textStart, marginBottom: spacing.md },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  monthGridTitle: { color: colors.text, fontSize: 15, fontFamily: fonts.semibold },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },

  weekdayRow: { flexDirection: "row", marginBottom: spacing.xs },
  weekday: { flex: 1, textAlign: "center", color: colors.textFaint, fontSize: 10, fontFamily: fonts.medium },

  weekRow: { flexDirection: "row" },
  cell: { flex: 1, aspectRatio: 1, padding: 3 },
  dayBox: {
    flex: 1,
    borderRadius: radius.cell,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  dayUnder: { backgroundColor: colors.accentTint, borderColor: colors.accentBorder },
  dayOver: { backgroundColor: OVER_BG, borderColor: OVER_BORDER },
  dayNone: { backgroundColor: colors.fill, borderColor: colors.line },
  dayToday: { borderColor: colors.accent, borderWidth: 2 },
  daySelected: { borderColor: colors.accentText },
  dayNum: { fontSize: 11, fontFamily: fonts.mono, color: colors.text },
  dayNumUnder: { color: colors.accentText },
  dayNumOver: { color: colors.overText },
  dayNumFaint: { color: colors.textFaint },
  dayCount: { fontSize: 13, fontFamily: fonts.semibold },
  dayCountUnder: { color: colors.accentText },
  dayCountOver: { color: colors.overText },

  tally: {
    flexDirection: "row",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tallyCell: { flex: 1, paddingHorizontal: spacing.sm },
  tallyDivider: { borderLeftWidth: 1, borderLeftColor: colors.line },
  tallyVal: { color: colors.text, fontSize: 21, fontFamily: fonts.monoMedium, textAlign: textStart },
  tallyLabel: { color: colors.textDim, fontSize: 11, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  sumDate: { color: colors.text, fontSize: 18, fontFamily: fonts.bold, textAlign: textStart },
  sumCount: { fontSize: 15, fontFamily: fonts.semibold, marginTop: spacing.xs, textAlign: textStart },
  ringPct: { color: colors.text, fontSize: 13, fontFamily: fonts.monoMedium },
  pillRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  pill: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: spacing.xs },
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
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.md,
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
});
