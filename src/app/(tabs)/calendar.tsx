/**
 * History — color-coded calendar (v2 light/green theme). Each day cell shows that
 * day's count, tinted by status: under/at allowance = green, over = red, no logs
 * = faint. A weekday header tops the grid. Tapping a day opens its detail below —
 * that day's cigarettes (editable only on today, with a location icon) + that
 * day's purchases.
 */
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddPurchaseSheet, AddPurchaseSheetRef } from "@/components/sheets/AddPurchaseSheet";
import { LogDetailSheet, LogDetailSheetRef } from "@/components/sheets/LogDetailSheet";
import { Ring } from "@/components/charts/Ring";
import { TabHeader } from "@/components/ui/TabHeader";
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
import { fonts, makeUseStyles, radius, spacing, useColors } from "@/theme";
import { MonthPager } from "../../../packages/month-pager";

// Per-cigarette location icon (Home / Work / Car / Social).
const TAG_ICON: Record<LocationTag, keyof typeof MaterialIcons.glyphMap> = {
  home: "home",
  work: "work-outline",
  car: "directions-car",
  social: "groups",
};

// Day-cell status tints (light theme).
const UNDER_BG = "rgba(46,204,113,0.15)";
const UNDER_BORDER = "rgba(46,204,113,0.4)";
const OVER_TEXT = "#C0392B";
const OVER_BG = "rgba(192,57,43,0.12)";
const OVER_BORDER = "rgba(192,57,43,0.35)";

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
  const green = useColors();
  const styles = useStyles();
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
  const ringColor = within ? green.green : OVER_TEXT;
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
                  // Selection always wins over the today-ring, so the cell the
                  // user actually picked is the one that reads as active.
                  sel && styles.daySelected,
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
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: green.bg }}>
      <TabHeader />
      <ScrollView
        style={{ flex: 1, backgroundColor: green.bg }}
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
            <MaterialIcons name={prevArrow} size={20} color={green.textDim} />
          </Pressable>
          <Text style={styles.monthGridTitle}>{monthGridTitle}</Text>
          <Pressable
            onPress={() => !atCurrentMonth && setFocused(new Date(focused.getFullYear(), focused.getMonth() + 1, 1))}
            hitSlop={8}
            disabled={atCurrentMonth}
            style={styles.navBtn}
          >
            <MaterialIcons name={nextArrow} size={20} color={atCurrentMonth ? green.border : green.textDim} />
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

        {/* Day summary */}
        <View style={styles.summary}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sumDate}>{formatWeekdayDate(selected, s.localeCode)}</Text>
            <Text style={[styles.sumCount, { color: ringColor }]}>
              {count} / {limit} {s.cigarettesSection.toLowerCase()}
            </Text>
          </View>
          <Ring size={56} strokeWidth={5} pct={pct} color={ringColor} track={green.border}>
            <Text style={styles.ringPct}>{Math.round(pct * 100)}%</Text>
          </Ring>
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <MaterialIcons name="attach-money" size={14} color={green.textDim} />
            <Text style={styles.pillLabel}>{s.spentLabel}</Text>
            <Text style={styles.pillValue}>{money(spent)}</Text>
          </View>
          <View style={styles.pill}>
            <MaterialIcons name="smoking-rooms" size={14} color={green.textDim} />
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
                <MaterialIcons name={TAG_ICON[log.tag]} size={18} color={green.textDim} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTitleLine}>
                  {/* Diary indicator: green dot = has a journal note, gray = none */}
                  <View style={[styles.diaryDot, !log.diary && styles.diaryDotMuted]} />
                  <Text style={styles.rowTitle}>{s.cigNumber(count - i)}</Text>
                  {!!log.diary && (
                    <View style={styles.diaryBadge}>
                      <MaterialIcons name="menu-book" size={11} color={green.green} />
                    </View>
                  )}
                </View>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {[formatTime(log.smokedAt), log.comment].filter(Boolean).join("  ·  ")}
                </Text>
              </View>
              <MaterialIcons name={isToday ? "edit" : "chevron-right"} size={isToday ? 14 : 20} color={green.textDim} />
            </Pressable>
          ))
        )}

        {/* Purchases */}
        <View style={styles.sectionRow}>
          <Text style={[styles.section, { marginTop: 0, marginBottom: 0 }]}>{s.purchases}</Text>
          {purchases.length > 0 && (
            <Pressable style={styles.viewAll} onPress={() => router.push("/purchases")} hitSlop={8}>
              <Text style={styles.viewAllText}>{s.viewAll}</Text>
              <MaterialIcons name={nextArrow} size={16} color={green.green} />
            </Pressable>
          )}
        </View>
        {selPurchases.length === 0 ? (
          <Text style={styles.empty}>{s.noPurchasesThisDay}</Text>
        ) : (
          selPurchases.map((p) => (
            <Pressable key={p.id} style={styles.row} onPress={() => purchaseRef.current?.present(p)}>
              <View style={styles.rowIcon}>
                <MaterialIcons name={p.unit === "carton" ? "inventory-2" : "receipt-long"} size={18} color={green.textDim} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {p.quantity} {p.unit === "carton" ? s.carton : s.pack}
                </Text>
                <Text style={styles.rowSub}>{formatTime(p.boughtAt)}</Text>
              </View>
              <Text style={styles.price}>{money(p.price)}</Text>
              <MaterialIcons name="edit" size={14} color={green.textDim} style={{ marginStart: spacing.sm }} />
            </Pressable>
          ))
        )}
      </ScrollView>

      <LogDetailSheet ref={detailRef} />
      <AddPurchaseSheet ref={purchaseRef} />
    </SafeAreaView>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
  title: { color: green.text, fontSize: 24, fontFamily: fonts.bold, textAlign: textStart, marginBottom: spacing.md },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  monthGridTitle: { color: green.text, fontSize: 15, fontFamily: fonts.semibold },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: green.border,
    alignItems: "center",
    justifyContent: "center",
  },

  weekdayRow: { flexDirection: "row", marginBottom: spacing.xs },
  weekday: { flex: 1, textAlign: "center", color: green.textDim, fontSize: 10, fontFamily: fonts.medium },

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
  dayUnder: { backgroundColor: UNDER_BG, borderColor: UNDER_BORDER },
  dayOver: { backgroundColor: OVER_BG, borderColor: OVER_BORDER },
  dayNone: { backgroundColor: green.cardSoft, borderColor: green.border },
  dayToday: { borderColor: green.green, borderWidth: 1.5 },
  // Selected day reads as the active one: bright ring + faint accent wash.
  daySelected: { borderColor: green.greenBright, borderWidth: 2, backgroundColor: green.cardSoft },
  dayNum: { fontSize: 11, fontFamily: fonts.mono, color: green.text },
  dayNumUnder: { color: green.green },
  dayNumOver: { color: OVER_TEXT },
  dayNumFaint: { color: green.textDim },
  dayCount: { fontSize: 13, fontFamily: fonts.semibold },
  dayCountUnder: { color: green.green },
  dayCountOver: { color: OVER_TEXT },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: green.border,
  },
  sumDate: { color: green.text, fontSize: 18, fontFamily: fonts.bold, textAlign: textStart },
  sumCount: { fontSize: 15, fontFamily: fonts.semibold, marginTop: spacing.xs, textAlign: textStart },
  ringPct: { color: green.text, fontSize: 13, fontFamily: fonts.monoMedium },
  pillRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  pill: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: spacing.xs },
  pillLabel: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular },
  pillValue: { color: green.text, fontSize: 14, fontFamily: fonts.bold },

  section: {
    color: green.textDim,
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
  viewAllText: { color: green.green, fontSize: 13, fontFamily: fonts.bold },
  empty: { color: green.textDim, fontFamily: fonts.regular, paddingVertical: spacing.md, textAlign: textStart },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: green.border,
    paddingVertical: spacing.md,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: green.cardSoft, alignItems: "center", justifyContent: "center" },
  rowTitleLine: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  diaryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: green.dot },
  diaryDotMuted: { backgroundColor: green.border },
  rowTitle: { color: green.text, fontFamily: fonts.semibold, fontSize: 14 },
  diaryBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: UNDER_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  rowSub: { color: green.textDim, fontSize: 13, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },
  price: { color: green.text, fontFamily: fonts.monoMedium, fontSize: 15 },
  }),
);
