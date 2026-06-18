/**
 * Today screen — redesigned from the Figma reference.
 * Header + hero allowance card (ring, progress, spent/saved), action buttons,
 * a 2×2 stats grid (Today / Day Streak / Avg Daily / Money Saved), today's log,
 * a recent-purchase card and a 7-day insight banner.
 *
 * Day Streak / Avg Daily / the insight use first-cut domain helpers — confirm
 * against the Flutter app before treating them as final (Step 7).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddPurchaseSheet, AddPurchaseSheetRef } from "@/components/AddPurchaseSheet";
import { AddSmokeSheet, AddSmokeSheetRef } from "@/components/AddSmokeSheet";
import { LogDetailSheet, LogDetailSheetRef } from "@/components/LogDetailSheet";
import { Ring } from "@/components/Ring";
import { useToast } from "@/components/Toast";
import {
    averagePerDay,
    currentLimit,
    currentStreak,
    logicalToday,
    logsForDay,
    sevenDayInsight,
    spentForDay,
    totalSaved,
} from "@/domain/logic";
import { formatTime, formatWeekdayDate } from "@/i18n/format";
import { useStrings } from "@/i18n/useStrings";
import { SmokeLog } from "@/models";
import { useAppStore } from "@/store/useAppStore";
import { colors, spacing } from "@/theme";
import { RefreshableScrollView } from "../../../packages/pull-refresh";

export default function TodayScreen() {
  const s = useStrings();
  const toast = useToast();

  const { logs, limits, purchases, settings } = useAppStore();
  const deleteLog = useAppStore((st) => st.deleteLog);
  const refresh = useAppStore((st) => st.refresh);

  const router = useRouter();
  const addRef = useRef<AddSmokeSheetRef>(null);
  const purchaseRef = useRef<AddPurchaseSheetRef>(null);
  const detailRef = useRef<LogDetailSheetRef>(null);

  const todayKey = logicalToday(settings.dayStartHour);
  const todayLogs = logsForDay(logs, todayKey, settings.dayStartHour);
  const count = todayLogs.length;
  const limit = currentLimit(limits, settings);
  const left = Math.max(0, limit - count);
  const within = count <= limit;
  const pct = limit === 0 ? 1 : Math.min(1, count / limit);
  const ringColor = within ? colors.ring : colors.bad;

  const spent = spentForDay(purchases, todayKey, settings.dayStartHour);
  const saved = totalSaved(logs, limits, settings);
  const streak = currentStreak(logs, limits, settings);
  const avg = averagePerDay(logs, limits, settings);
  const insight = sevenDayInsight(logs, settings);

  const cur = settings.currencySymbol;
  const money = (n: number) =>
    `${cur}${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}`;

  const recent = purchases.length ? purchases[purchases.length - 1] : null;
  const shortDate = (d: Date) =>
    new Intl.DateTimeFormat(s.localeCode, { month: "short", day: "numeric" }).format(d);

  const insightText =
    insight.diff > 0
      ? s.insightFewer(insight.diff)
      : insight.diff < 0
        ? s.insightMore(-insight.diff)
        : s.insightSame;

  const onLogged = (log: SmokeLog) => {
    toast.show({ message: s.loggedToast, actionLabel: s.undo, onAction: () => deleteLog(log.id) });
  };
  const openDiary = () => router.navigate("/calendar");
  const soon = () => toast.show({ message: s.comingSoon }); // bell → notifications (Step 22)

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <RefreshableScrollView
        onRefresh={refresh}
        threshold={70}
        resistance={0.8}
        spinnerColor={colors.accent}
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={{
          paddingTop: spacing.sm,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xxl,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appTitle}>{s.appTitle}</Text>
            <Text style={styles.date}>{formatWeekdayDate(todayKey, s.localeCode)}</Text>
          </View>
          <Pressable style={styles.bell} onPress={soon}>
            <MaterialIcons name="notifications-none" size={18} color={colors.textDim} />
          </Pressable>
        </View>

        {/* Hero — today's allowance */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>{s.todaysAllowance}</Text>
              <View style={styles.bigRow}>
                <Text style={styles.big}>{left}</Text>
                <Text style={styles.bigSuffix}>{s.leftLabel}</Text>
              </View>
              <Text style={styles.usedToday}>{s.usedToday(count, limit)}</Text>
            </View>
            <Ring size={72} strokeWidth={6} pct={pct} color={ringColor}>
              <Text style={styles.ringPct}>{Math.round(pct * 100)}%</Text>
            </Ring>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: ringColor }]} />
          </View>

          <View style={styles.subRow}>
            <View style={styles.subCard}>
              <Text style={styles.subLabel}>{s.spentToday}</Text>
              <Text style={styles.subValue}>{money(spent)}</Text>
            </View>
            <View style={styles.subCard}>
              <Text style={styles.subLabel}>{s.savedShort}</Text>
              <Text style={[styles.subValue, { color: colors.accent }]}>{money(saved)}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.primaryBtn} onPress={() => addRef.current?.present()}>
            <MaterialIcons name="add" size={20} color={colors.accent} />
            <Text style={styles.primaryText}>{s.addCigarette}</Text>
          </Pressable>
          <Pressable style={styles.outlineBtn} onPress={() => purchaseRef.current?.present()}>
            <MaterialIcons name="shopping-cart" size={18} color={colors.textDim} />
            <Text style={styles.outlineText}>{s.addPurchase}</Text>
          </Pressable>
        </View>

        {/* Stats grid */}
        <View style={styles.grid}>
          <StatCard icon="event" value={`${count}`} label={s.today} />
          <StatCard
            icon="local-fire-department"
            emoji={streak === 0 ? "🥀" : undefined}
            value={`${streak}`}
            label={s.dayStreak}
            tint={streak === 0 ? colors.bad : colors.streak}
          />
          <StatCard icon="show-chart" value={`${avg}`} label={s.avgDaily} />
          <StatCard icon="savings" value={money(saved)} label={s.moneySaved} accent />
        </View>

        {/* Today's log */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>{s.todaysLog}</Text>
          <Pressable onPress={openDiary}>
            <Text style={styles.link}>{s.viewAll}</Text>
          </Pressable>
        </View>

        {todayLogs.length === 0 ? (
          <Text style={styles.empty}>{s.nothingToday}</Text>
        ) : (
          [...todayLogs]
            .reverse()
            .slice(0, 3)
            .map((log, i) => {
              const sub = [formatTime(log.smokedAt), log.comment || log.diary]
                .filter(Boolean)
                .join("  ·  ");
              return (
                <Pressable
                  key={log.id}
                  style={styles.tile}
                  onPress={() => detailRef.current?.present({ log, number: count - i, editable: true })}
                >
                  <View style={styles.tileIcon}>
                    <MaterialIcons name="smoking-rooms" size={18} color={colors.textDim} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tileTitle}>{s.cigNumber(count - i)}</Text>
                    {!!sub && (
                      <Text style={styles.tileSub} numberOfLines={1}>
                        {sub}
                      </Text>
                    )}
                  </View>
                  <MaterialIcons name="edit" size={14} color={colors.textDim} />
                </Pressable>
              );
            })
        )}

        {/* Recent purchase */}
        <View style={styles.purchaseCard}>
          <View style={styles.purchaseHead}>
            <View style={styles.subHead}>
              <MaterialIcons name="receipt-long" size={16} color={colors.textDim} />
              <Text style={styles.subLabel}>{s.recentPurchase}</Text>
            </View>
            {recent && <Text style={styles.subLabel}>{shortDate(recent.boughtAt)}</Text>}
          </View>
          {recent ? (
            <>
              <View style={styles.purchaseRow}>
                <Text style={styles.purchaseTitle}>
                  {recent.quantity} {recent.unit === "carton" ? s.carton : s.pack}
                </Text>
                <Text style={styles.purchaseTitle}>{money(recent.price)}</Text>
              </View>
              <View style={styles.purchaseRow}>
                <Text style={styles.tileSub}>{s.purchases}</Text>
                <Pressable onPress={openDiary}>
                  <Text style={styles.link}>{s.viewHistory}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <Text style={styles.tileSub}>{s.noPurchasesYet}</Text>
          )}
        </View>

        {/* 7-day insight */}
        <View style={styles.insight}>
          <View style={styles.insightIcon}>
            <MaterialIcons name="bolt" size={18} color={colors.accent} />
          </View>
          <Text style={styles.insightText}>{insightText}</Text>
        </View>
      </RefreshableScrollView>

      <AddSmokeSheet ref={addRef} onLogged={onLogged} />
      <AddPurchaseSheet ref={purchaseRef} />
      <LogDetailSheet ref={detailRef} />
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
  tint,
  accent,
  emoji,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  label: string;
  tint?: string;
  accent?: boolean;
  emoji?: string;
}) {
  const iconColor = tint ?? (accent ? colors.accent : colors.textDim);
  return (
    <View style={[styles.stat, accent && styles.statAccent]}>
      <View
        style={[
          styles.statIcon,
          { backgroundColor: emoji ? colors.fill : tint ? "rgba(251,146,60,0.12)" : accent ? colors.accentTint : colors.fill },
        ]}
      >
        {emoji ? (
          <Text style={{ fontSize: 15 }}>{emoji}</Text>
        ) : (
          <MaterialIcons name={icon} size={16} color={iconColor} />
        )}
      </View>
      <Text style={[styles.statValue, accent && { color: colors.accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  appTitle: { color: colors.text, fontSize: 24, fontWeight: "800" },
  date: { color: colors.textDim, fontSize: 14, marginTop: 2 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  hero: {
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: 0,
  },
  heroTop: { flexDirection: "row", alignItems: "center" },
  heroLabel: { color: colors.textDim, fontSize: 14 },
  bigRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, marginTop: spacing.xs },
  big: { color: colors.text, fontSize: 44, fontWeight: "800", lineHeight: 48 },
  bigSuffix: { color: colors.textDim, fontSize: 20, fontWeight: "600", marginBottom: 6 },
  usedToday: { color: colors.textDim, fontSize: 13, marginTop: spacing.xs },
  ringPct: { color: colors.text, fontSize: 14, fontWeight: "700" },

  track: { height: 6, borderRadius: 3, backgroundColor: colors.track, marginTop: spacing.lg, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },

  subRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  subCard: { flex: 1, backgroundColor: "transparent", borderRadius: 0, paddingVertical: spacing.xs },
  subHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  subLabel: { color: colors.textDim, fontSize: 12 },
  subValue: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 2 },

  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  primaryText: { color: colors.accent, fontWeight: "700", fontSize: 15 },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  outlineText: { color: colors.text, fontWeight: "600", fontSize: 15 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.lg },
  stat: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 96,
  },
  statAccent: { backgroundColor: colors.accentTint, borderColor: colors.accentBorder },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: "800" },
  statLabel: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
    lineHeight: 16,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  link: { color: colors.accent, fontSize: 14, fontWeight: "600" },
  empty: { color: colors.textDim, textAlign: "center", paddingVertical: spacing.xl },

  tile: {
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
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.fill,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: { color: colors.text, fontWeight: "700", fontSize: 15 },
  tileSub: { color: colors.textDim, fontSize: 13, marginTop: 2 },

  purchaseCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  purchaseHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  purchaseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  purchaseTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },

  insight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  insightText: { color: colors.text, fontSize: 14, flex: 1, lineHeight: 20 },
});
