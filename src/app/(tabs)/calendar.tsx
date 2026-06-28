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
import { useMemo, useRef, useState } from "react";
import { I18nManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { AddPurchaseSheet, AddPurchaseSheetRef } from "@/components/sheets/AddPurchaseSheet";
import { LogDetailSheet, LogDetailSheetRef } from "@/components/sheets/LogDetailSheet";
import { Ring } from "@/components/charts/Ring";
import { TabHeader } from "@/components/ui/TabHeader";
import { dayKey, isSameDay, keyOf } from "@/domain/day";
import {
  limitForDay,
  logicalDay,
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
import { useColors } from "@/theme";
import { Pressable, ScrollView, Text, View } from "@/tw";
import { MonthPager } from "../../../packages/month-pager";

// Per-cigarette location icon (Home / Work / Car / Social).
const TAG_ICON: Record<LocationTag, keyof typeof MaterialIcons.glyphMap> = {
  home: "home",
  work: "work-outline",
  car: "directions-car",
  social: "groups",
};

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

/** Diary tab: status-tinted month calendar; tapping a day shows its logs + purchases. */
export default function HistoryScreen() {
  const s = useStrings();
  const green = useColors();
  const router = useRouter();
  // Select only the slices this screen reads (shallow-compared) so an unrelated
  // store write doesn't re-render the whole calendar.
  const { logs, limits, purchases, settings } = useAppStore(
    useShallow((st) => ({ logs: st.logs, limits: st.limits, purchases: st.purchases, settings: st.settings })),
  );
  const dsh = settings.dayStartHour;

  // Per-day counts in one pass over logs, so the 42-cell × 3-month grid can look
  // each day up O(1) instead of re-scanning every log per cell (countForDay).
  const countByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of logs) {
      const k = dayKey(logicalDay(l.smokedAt, dsh));
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [logs, dsh]);

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
  const ringColor = within ? green.green : green.overText;
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
      <View key={wi} className="flex-row">
        {week.map((day, di) => {
          if (!day) return <View key={di} className="flex-1 aspect-square p-[3px]" />;
          const future = keyOf(day) > today;
          const c = countByDay.get(dayKey(day)) ?? 0;
          const lim = limitForDay(limits, day, settings);
          const sel = isSameDay(day, selected);
          const isTodayCell = isSameDay(day, today);
          const status = future ? "future" : c === 0 ? "none" : c <= lim ? "under" : "over";
          // One class per property (selection > today > status), so conflicting
          // border/bg utilities never stack (NativeWind resolves same-property
          // conflicts by CSS order, not className order).
          const cellBg = sel
            ? "bg-card-soft"
            : status === "under"
              ? "bg-under-bg"
              : status === "over"
                ? "bg-over-bg"
                : status === "none"
                  ? "bg-card-soft"
                  : "";
          const cellBorder = sel
            ? "border-2 border-green-bright"
            : isTodayCell
              ? "border-[1.5px] border-green"
              : status === "under"
                ? "border border-under-border"
                : status === "over"
                  ? "border border-over-border"
                  : status === "none"
                    ? "border border-border"
                    : "border border-transparent";
          const numColor =
            status === "under"
              ? "text-green"
              : status === "over"
                ? "text-over-text"
                : "text-text-dim";
          return (
            <Pressable
              key={di}
              className="flex-1 aspect-square p-[3px]"
              disabled={future}
              accessibilityRole="button"
              accessibilityLabel={s.a11yDayCell(day.getDate(), c, status === "over" ? "over" : status === "under" ? "under" : "none")}
              onPress={() => {
                setSelected(keyOf(day));
                setFocused(new Date(day.getFullYear(), day.getMonth(), 1));
              }}
            >
              <View className={`flex-1 rounded-cell items-center justify-center gap-px ${cellBorder} ${cellBg}`}>
                <Text className={`text-[11px] font-mono ${numColor}`}>{day.getDate()}</Text>
                {!future && c > 0 && (
                  // Over-days underline the count too, so "over the limit" isn't
                  // signalled by red color alone (WCAG 1.4.1).
                  <Text className={`text-[13px] font-semibold ${status === "over" ? "text-over-text underline" : "text-green"}`}>
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
        className="flex-1 bg-bg"
        contentContainerClassName="pt-2 px-5 pb-6"
        alwaysBounceVertical
        overScrollMode="always"
      >
        <Text className="text-text text-[24px] font-bold mb-3" style={{ textAlign: textStart }}>{s.diaryTab}</Text>

        {/* Month nav */}
        <View className="flex-row items-center justify-between mb-2">
          <Pressable
            onPress={() => setFocused(new Date(focused.getFullYear(), focused.getMonth() - 1, 1))}
            hitSlop={8}
            className="w-8 h-8 rounded-[9px] border border-border items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={s.a11yPrevMonth}
          >
            <MaterialIcons name={prevArrow} size={20} color={green.textDim} />
          </Pressable>
          <Text className="text-text text-[15px] font-semibold">{monthGridTitle}</Text>
          <Pressable
            onPress={() => !atCurrentMonth && setFocused(new Date(focused.getFullYear(), focused.getMonth() + 1, 1))}
            hitSlop={8}
            disabled={atCurrentMonth}
            className="w-8 h-8 rounded-[9px] border border-border items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={s.a11yNextMonth}
          >
            <MaterialIcons name={nextArrow} size={20} color={atCurrentMonth ? green.border : green.textDim} />
          </Pressable>
        </View>

        {/* Weekday header */}
        <View className="flex-row mb-1">
          {weekdays.map((w, i) => (
            <Text key={i} className="flex-1 text-center text-text-dim text-[10px] font-medium">
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
        <View className="flex-row items-center py-3 mt-3 border-t border-border">
          <View className="flex-1">
            <Text className="text-text text-[18px] font-bold" style={{ textAlign: textStart }}>{formatWeekdayDate(selected, s.localeCode)}</Text>
            <Text className="text-[15px] font-semibold mt-1" style={{ textAlign: textStart, color: ringColor }}>
              {count} / {limit} {s.cigarettesSection.toLowerCase()}
            </Text>
          </View>
          <Ring size={56} strokeWidth={5} pct={pct} color={ringColor} track={green.border}>
            <Text className="text-text text-[13px] font-mono-medium">{Math.round(pct * 100)}%</Text>
          </Ring>
        </View>
        <View className="flex-row gap-3 mt-2">
          <View className="flex-1 flex-row items-center gap-1.5 py-1">
            <MaterialIcons name="attach-money" size={14} color={green.textDim} />
            <Text className="text-text-dim text-[12px] font-regular">{s.spentLabel}</Text>
            <Text className="text-text text-[14px] font-bold">{money(spent)}</Text>
          </View>
          <View className="flex-1 flex-row items-center gap-1.5 py-1">
            <MaterialIcons name="smoking-rooms" size={14} color={green.textDim} />
            <Text className="text-text text-[14px] font-bold">{s.loggedN(count)}</Text>
          </View>
        </View>

        {/* Cigarettes */}
        <Text className="text-text-dim text-[12px] uppercase tracking-[1.2px] font-medium mt-6 mb-2" style={{ textAlign: textStart }}>{s.cigarettesSection}</Text>
        {selLogs.length === 0 ? (
          <Text className="text-text-dim font-regular py-3" style={{ textAlign: textStart }}>{s.noLogsThisDay}</Text>
        ) : (
          [...selLogs].reverse().map((log, i) => (
            <Pressable
              key={log.id}
              className="flex-row items-center gap-3 border-b border-border py-3"
              onPress={() => detailRef.current?.present({ log, number: count - i, editable: isToday })}
            >
              <View className="w-9 h-9 rounded-[18px] bg-card-soft items-center justify-center">
                <MaterialIcons name={TAG_ICON[log.tag]} size={18} color={green.textDim} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  {/* Diary indicator: green dot = has a journal note, gray = none */}
                  <View className={`w-2 h-2 rounded-full ${log.diary ? "bg-dot" : "bg-border"}`} />
                  <Text className="text-text font-semibold text-[14px]">{s.cigNumber(count - i)}</Text>
                  {!!log.diary && (
                    <View className="w-5 h-5 rounded-full bg-under-bg items-center justify-center">
                      <MaterialIcons name="menu-book" size={11} color={green.green} />
                    </View>
                  )}
                </View>
                <Text className="text-text-dim text-[13px] font-regular mt-0.5" style={{ textAlign: textStart }} numberOfLines={1}>
                  {[formatTime(log.smokedAt), log.comment].filter(Boolean).join("  ·  ")}
                </Text>
              </View>
              <MaterialIcons name={isToday ? "edit" : "chevron-right"} size={isToday ? 14 : 20} color={green.textDim} />
            </Pressable>
          ))
        )}

        {/* Purchases */}
        <View className="flex-row items-center justify-between mt-6 mb-2">
          <Text className="text-text-dim text-[12px] uppercase tracking-[1.2px] font-medium" style={{ textAlign: textStart }}>{s.purchases}</Text>
          {purchases.length > 0 && (
            <Pressable className="flex-row items-center gap-0.5" onPress={() => router.push("/purchases")} hitSlop={8}>
              <Text className="text-green text-[13px] font-bold">{s.viewAll}</Text>
              <MaterialIcons name={nextArrow} size={16} color={green.green} />
            </Pressable>
          )}
        </View>
        {selPurchases.length === 0 ? (
          <Text className="text-text-dim font-regular py-3" style={{ textAlign: textStart }}>{s.noPurchasesThisDay}</Text>
        ) : (
          selPurchases.map((p) => (
            <Pressable key={p.id} className="flex-row items-center gap-3 border-b border-border py-3" onPress={() => purchaseRef.current?.present(p)}>
              <View className="w-9 h-9 rounded-[18px] bg-card-soft items-center justify-center">
                <MaterialIcons name={p.unit === "carton" ? "inventory-2" : "receipt-long"} size={18} color={green.textDim} />
              </View>
              <View className="flex-1">
                <Text className="text-text font-semibold text-[14px]">
                  {p.quantity} {p.unit === "carton" ? s.carton : s.pack}
                </Text>
                <Text className="text-text-dim text-[13px] font-regular mt-0.5" style={{ textAlign: textStart }}>{formatTime(p.boughtAt)}</Text>
              </View>
              <Text className="text-text font-mono-medium text-[15px]">{money(p.price)}</Text>
              <MaterialIcons name="edit" size={14} color={green.textDim} style={{ marginStart: 8 }} />
            </Pressable>
          ))
        )}
      </ScrollView>

      <LogDetailSheet ref={detailRef} />
      <AddPurchaseSheet ref={purchaseRef} />
    </SafeAreaView>
  );
}

