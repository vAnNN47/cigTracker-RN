/**
 * Progress screen — ported from lib/screens/stats_screen.dart.
 * Range picker, summary stats, week-vs-week, cigs-vs-limit line chart, time-of-day
 * histogram, money-saved line chart, spend summary. Charts use react-native-svg
 * (no extra chart lib).
 */
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LineChart } from "@/components/LineChart";
import { addDays } from "@/domain/day";
import {
  countBetween,
  dailyStats,
  hourlyHistogram,
  logicalToday,
  savingsSeries,
  totalCigarettesBought,
  totalSpent,
  withinLimit,
} from "@/domain/logic";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { colors, radius, spacing } from "@/theme";

const RANGES: { key: string; value: number | null }[] = [
  { key: "7d", value: 7 },
  { key: "30d", value: 30 },
  { key: "All", value: null },
];

export default function ProgressScreen() {
  const s = useStrings();
  const { logs, limits, purchases, settings } = useAppStore();
  const dsh = settings.dayStartHour;
  const cur = settings.currencySymbol;

  const [range, setRange] = useState<number | null>(30);

  const stats = dailyStats(logs, limits, settings, range ?? undefined);
  const savings = savingsSeries(logs, limits, settings, range ?? undefined);
  const histogram = hourlyHistogram(logs, dsh, range ?? undefined);

  const withinDays = stats.filter(withinLimit).length;
  const avg = stats.length ? stats.reduce((a, st) => a + st.count, 0) / stats.length : 0;
  const totalSaved = savings.length ? savings[savings.length - 1].saved : 0;

  const today = logicalToday(dsh);
  const weekNow = countBetween(logs, addDays(today, -6), today, dsh);
  const weekPrev = countBetween(logs, addDays(today, -13), addDays(today, -7), dsh);
  const delta = weekNow - weekPrev;
  const deltaColor = delta < 0 ? colors.good : delta > 0 ? colors.bad : colors.textDim;
  const deltaText =
    delta < 0 ? s.fewerThanLast(-delta) : delta > 0 ? s.moreThanLast(delta) : s.sameAsLast;
  const deltaIcon = delta < 0 ? "trending-down" : delta > 0 ? "trending-up" : "trending-flat";

  // Time-of-day histogram (plain views, like Flutter)
  const hist = Array.from({ length: 24 }, (_, h) => histogram[h] ?? 0);
  const histTotal = hist.reduce((a, b) => a + b, 0);
  const histMax = Math.max(0, ...hist);
  let peakHour = 0;
  hist.forEach((c, h) => {
    if (c > hist[peakHour]) peakHour = h;
  });
  const peakLabel = `${String(peakHour).padStart(2, "0")}:00`;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ paddingTop: spacing.md, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}
        alwaysBounceVertical={false}
        overScrollMode="never"
      >
        <Text style={styles.title}>{s.progress}</Text>

        {/* Range picker */}
        <View style={styles.rangeRow}>
          {RANGES.map((r) => {
            const sel = range === r.value;
            return (
              <Pressable
                key={r.key}
                onPress={() => setRange(r.value)}
                style={[styles.chip, { backgroundColor: sel ? colors.accent : colors.surface }]}
              >
                <Text style={{ color: sel ? colors.onAccent : colors.textDim, fontWeight: "600" }}>
                  {r.key}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Summary stats */}
        <View style={styles.statRow}>
          <Stat label={s.avgPerDay} value={avg.toFixed(1)} color={colors.text} />
          <Stat label={s.onTargetDays} value={`${withinDays} / ${stats.length}`} color={colors.good} />
          <Stat label={s.saved} value={`${cur}${totalSaved.toFixed(0)}`} color={colors.good} />
        </View>

        {/* Week vs week */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>{s.weekVsWeek}</Text>
          <View style={styles.weekRow}>
            <WeekStat label={s.thisWeek} value={weekNow} />
            <WeekStat label={s.lastWeek} value={weekPrev} dim />
            <View style={{ flex: 1 }} />
            <MaterialIcons name={deltaIcon} size={20} color={deltaColor} />
          </View>
          <Text style={{ color: deltaColor, fontWeight: "600", marginTop: spacing.sm }}>{deltaText}</Text>
        </View>

        {/* Cigs vs limit */}
        <Text style={styles.section}>{s.cigsVsLimit}</Text>
        <View style={styles.chartCard}>
          <LineChart
            series={[
              { points: stats.map((st) => st.count), color: colors.accent, fill: true },
              { points: stats.map((st) => st.limit), color: colors.textDim, dashed: true },
            ]}
            overMask={stats.map((st) => st.count > st.limit)}
            overColor={colors.bad}
            xLabels={stats.map((st) => `${st.day.getDate()}/${st.day.getMonth() + 1}`)}
            formatY={(v) => String(Math.round(v))}
          />
        </View>
        <View style={styles.legend}>
          <Legend color={colors.accent} label={s.smoked} />
          <Legend color={colors.textDim} label={s.limitLabel} />
          <Legend color={colors.bad} label={s.over} />
        </View>

        {/* Time of day */}
        <View style={[styles.cardBox, { marginTop: spacing.lg }]}>
          <Text style={styles.cardTitle}>{s.whenYouSmoke}</Text>
          <Text style={styles.sub}>{histTotal < 3 ? s.notEnoughData : s.peakAround(peakLabel)}</Text>
          <View style={styles.histRow}>
            {hist.map((c, h) => {
              const frac = histMax === 0 ? 0 : c / histMax;
              const isPeak = h === peakHour && c > 0;
              return (
                <View
                  key={h}
                  style={{
                    flex: 1,
                    marginHorizontal: 1,
                    height: 4 + frac * 48,
                    borderRadius: 3,
                    backgroundColor: isPeak ? colors.accent : colors.accentSoft,
                  }}
                />
              );
            })}
          </View>
          <View style={styles.ticks}>
            {["00", "06", "12", "18", "23"].map((t) => (
              <Text key={t} style={styles.tick}>
                {t}
              </Text>
            ))}
          </View>
        </View>

        {/* Money saved */}
        <Text style={styles.section}>{s.moneySaved}</Text>
        <Text style={styles.sub}>{s.baselineNote(settings.baselinePerDay)}</Text>
        <View style={[styles.chartCard, { marginTop: spacing.sm }]}>
          <LineChart
            series={[{ points: savings.map((p) => p.saved), color: colors.accent, fill: true }]}
            xLabels={savings.map((p) => `${p.day.getDate()}/${p.day.getMonth() + 1}`)}
            formatY={(v) => `${cur}${Math.round(v)}`}
          />
        </View>

        {/* Spend summary */}
        <View style={[styles.cardBox, styles.spendRow, { marginTop: spacing.lg }]}>
          <MaterialIcons name="payments" size={22} color={colors.textDim} />
          <Text style={styles.spendText}>
            {s.spentSummary(cur, totalSpent(purchases).toFixed(0), totalCigarettesBought(purchases))}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function WeekStat({ label, value, dim }: { label: string; value: number; dim?: boolean }) {
  return (
    <View style={{ marginRight: spacing.xxl }}>
      <Text style={{ fontSize: 24, fontWeight: "700", color: dim ? colors.textDim : colors.text }}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: spacing.md },
  rangeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20 },
  statRow: { flexDirection: "row", gap: spacing.md },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { color: colors.textDim, fontSize: 11, marginTop: spacing.xs },
  cardBox: { backgroundColor: colors.surface, borderRadius: 18, padding: spacing.lg, marginTop: spacing.lg },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "600" },
  weekRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.md },
  section: { color: colors.text, fontSize: 16, fontWeight: "600", marginTop: spacing.xxl },
  sub: { color: colors.textDim, fontSize: 12, marginTop: spacing.xs },
  chartCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md, marginTop: spacing.sm },
  legend: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.sm },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: colors.textDim, fontSize: 12 },
  histRow: { flexDirection: "row", alignItems: "flex-end", height: 56, marginTop: spacing.md },
  ticks: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  tick: { color: colors.textDim, fontSize: 10 },
  spendRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  spendText: { color: colors.textDim, flex: 1 },
});
