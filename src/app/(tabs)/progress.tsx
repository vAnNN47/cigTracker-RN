/**
 * Progress — v2 light/green theme. Hairline-separated metric cells, mono numbers,
 * uppercase eyebrow section labels, and the react-native-svg charts (now told to
 * draw light gridlines/labels). The week-over-week delta only shows when there
 * was a tracked previous week, so it never claims "more than last week" against a
 * week that simply had no data.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LineChart } from "@/components/LineChart";
import { TabHeader } from "@/components/TabHeader";
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
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { fonts, makeUseStyles, spacing, useColors } from "@/theme";

const BAD = "#C0392B";
const HIST_SOFT = "rgba(46,204,113,0.3)";

const RANGES: { key: string; value: number | null }[] = [
  { key: "7d", value: 7 },
  { key: "30d", value: 30 },
  { key: "All", value: null },
];

export default function ProgressScreen() {
  const s = useStrings();
  const green = useColors();
  const styles = useStyles();
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
  // Only compare when the previous week actually had tracked data.
  const showDelta = weekPrev > 0;
  const delta = weekNow - weekPrev;
  const deltaColor = delta < 0 ? green.green : delta > 0 ? BAD : green.textDim;
  const deltaText = delta < 0 ? s.fewerThanLast(-delta) : delta > 0 ? s.moreThanLast(delta) : s.sameAsLast;
  const deltaIcon = delta < 0 ? "trending-down" : delta > 0 ? "trending-up" : "trending-flat";

  const hist = Array.from({ length: 24 }, (_, h) => histogram[h] ?? 0);
  const histTotal = hist.reduce((a, b) => a + b, 0);
  const histMax = Math.max(0, ...hist);
  let peakHour = 0;
  hist.forEach((c, h) => {
    if (c > hist[peakHour]) peakHour = h;
  });
  const peakLabel = `${String(peakHour).padStart(2, "0")}:00`;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: green.bg }}>
      <TabHeader />
      <ScrollView
        style={{ flex: 1, backgroundColor: green.bg }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingHorizontal: 22, paddingBottom: spacing.xxl }}
        alwaysBounceVertical
        overScrollMode="always"
      >
        {/* Header + range */}
        <Text style={styles.title}>{s.progress}</Text>
        <View style={styles.rangeRow}>
          {RANGES.map((r) => {
            const sel = range === r.value;
            return (
              <Pressable
                key={r.key}
                onPress={() => setRange(r.value)}
                style={[styles.chip, sel && styles.chipSel]}
              >
                <Text style={[styles.chipText, sel && styles.chipTextSel]}>{r.key}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Metrics — two hairline-separated rows of two cells */}
        <View style={styles.metrics}>
          <View style={styles.metricRow}>
            <Metric value={avg.toFixed(1)} label={s.avgPerDay} />
            <Metric
              value={`${withinDays}`}
              valueSuffix={` / ${stats.length}`}
              valueColor={green.green}
              label={s.onTargetDays}
              divider
            />
          </View>
          <View style={[styles.metricRow, styles.metricRowDivider]}>
            <Metric value={`${cur}${totalSaved.toFixed(0)}`} valueColor={green.green} label={s.saved} />
            <Metric
              value={`${weekNow}`}
              label={s.thisWeek}
              trailing={showDelta ? <MaterialIcons name={deltaIcon} size={18} color={deltaColor} /> : undefined}
              caption={showDelta ? deltaText : undefined}
              captionColor={showDelta ? deltaColor : undefined}
              divider
            />
          </View>
        </View>

        {/* Cigs vs limit */}
        <Section title={s.cigsVsLimit}>
          <View style={styles.chartWrap}>
            <LineChart
              series={[
                { points: stats.map((st) => st.count), color: green.green, fill: true },
                { points: stats.map((st) => st.limit), color: green.textDim, dashed: true },
              ]}
              overMask={stats.map((st) => st.count > st.limit)}
              overColor={BAD}
              xLabels={stats.map((st) => `${st.day.getDate()}/${st.day.getMonth() + 1}`)}
              formatY={(v) => String(Math.round(v))}
              gridColor={green.border}
              labelColor={green.textDim}
            />
          </View>
          <View style={styles.legend}>
            <Legend color={green.green} label={s.smoked} />
            <Legend color={green.textDim} label={s.limitLabel} />
            <Legend color={BAD} label={s.over} />
          </View>
        </Section>

        {/* Time of day */}
        <Section title={s.whenYouSmoke} sub={histTotal < 3 ? s.notEnoughData : s.peakAround(peakLabel)}>
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
                    backgroundColor: isPeak ? green.green : HIST_SOFT,
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
        </Section>

        {/* Money saved */}
        <Section title={s.moneySaved} sub={s.baselineNote(settings.baselinePerDay)}>
          <View style={styles.chartWrap}>
            <LineChart
              series={[{ points: savings.map((p) => p.saved), color: green.green, fill: true }]}
              xLabels={savings.map((p) => `${p.day.getDate()}/${p.day.getMonth() + 1}`)}
              formatY={(v) => `${cur}${Math.round(v)}`}
              gridColor={green.border}
              labelColor={green.textDim}
            />
          </View>
        </Section>

        {/* Spend summary */}
        <View style={styles.spendRow}>
          <MaterialIcons name="payments" size={20} color={green.textDim} />
          <Text style={styles.spendText}>
            {s.spentSummary(cur, totalSpent(purchases).toFixed(0), totalCigarettesBought(purchases))}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({
  value,
  valueSuffix,
  valueColor,
  label,
  caption,
  captionColor,
  trailing,
  divider,
}: {
  value: string;
  valueSuffix?: string;
  valueColor?: string;
  label: string;
  caption?: string;
  captionColor?: string;
  trailing?: ReactNode;
  divider?: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.metricCell, divider && styles.metricCellDivider]}>
      <View style={styles.metricTop}>
        <Text style={[styles.metricVal, valueColor ? { color: valueColor } : null]}>
          {value}
          {valueSuffix ? <Text style={styles.metricValDim}>{valueSuffix}</Text> : null}
        </Text>
        {trailing}
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      {caption ? (
        <Text style={[styles.metricCaption, captionColor ? { color: captionColor } : null]} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>{title}</Text>
      {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
      {children}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  const styles = useStyles();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const useStyles = makeUseStyles((green) =>
  StyleSheet.create({
  title: { color: green.text, fontSize: 22, fontFamily: fonts.bold, textAlign: textStart, marginBottom: spacing.md },

  rangeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: 999, backgroundColor: green.cardSoft },
  chipSel: { backgroundColor: green.green },
  chipText: { color: green.textDim, fontSize: 13, fontFamily: fonts.semibold },
  chipTextSel: { color: green.onGreen },

  metrics: { marginBottom: spacing.sm },
  metricRow: { flexDirection: "row" },
  metricRowDivider: { borderTopWidth: 1, borderTopColor: green.border },
  metricCell: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  metricCellDivider: { borderLeftWidth: 1, borderLeftColor: green.border },
  metricTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metricVal: { color: green.text, fontSize: 24, fontFamily: fonts.monoSemibold, textAlign: textStart },
  metricValDim: { color: green.textDim, fontSize: 16, fontFamily: fonts.mono },
  metricLabel: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular, marginTop: 4, textAlign: textStart },
  metricCaption: { fontSize: 11, fontFamily: fonts.medium, marginTop: 2, textAlign: textStart },

  section: { paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: green.border },
  eyebrow: {
    color: green.textDim,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: fonts.medium,
    textAlign: textStart,
  },
  sectionSub: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular, marginTop: 4, textAlign: textStart },
  chartWrap: { marginTop: spacing.md },

  legend: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: green.textDim, fontSize: 12, fontFamily: fonts.regular },

  histRow: { flexDirection: "row", alignItems: "flex-end", height: 56, marginTop: spacing.md },
  ticks: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  tick: { color: green.textDim, fontSize: 10, fontFamily: fonts.regular },

  spendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: green.border,
  },
  spendText: { color: green.textDim, flex: 1, fontSize: 13, fontFamily: fonts.regular, textAlign: textStart },
  }),
);
