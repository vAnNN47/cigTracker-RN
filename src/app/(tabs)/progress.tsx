/**
 * Progress screen — bento-MOSAIC design language (its own look vs Today's boxes).
 * Tight, tessellated, color-filled tiles with no borders — reads as a solid
 * dashboard mosaic rather than cards floating on the background. Charts use
 * react-native-svg. Logic ported from lib/screens/stats_screen.dart.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
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
import { textStart } from "@/i18n/rtl";
import { useStrings } from "@/i18n/useStrings";
import { useAppStore } from "@/store/useAppStore";
import { colors, fonts, spacing } from "@/theme";

const RANGES: { key: string; value: number | null }[] = [
  { key: "7d", value: 7 },
  { key: "30d", value: 30 },
  { key: "All", value: null },
];

const GAP = 6; // tight gap so tiles tessellate
const GOOD_TINT = "rgba(45,212,191,0.12)";

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
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ paddingTop: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
        alwaysBounceVertical
        overScrollMode="always"
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
                style={[styles.chip, { backgroundColor: sel ? colors.accent : colors.surfaceHigh }]}
              >
                <Text style={{ color: sel ? colors.onAccent : colors.textDim, fontFamily: fonts.semibold }}>{r.key}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Bento metric mosaic */}
        <View style={styles.grid}>
          <Tile bg={colors.surfaceHigh}>
            <Text style={styles.tileValue}>{avg.toFixed(1)}</Text>
            <Text style={styles.tileLabel}>{s.avgPerDay}</Text>
          </Tile>
          <Tile bg={GOOD_TINT}>
            <Text style={[styles.tileValue, { color: colors.good }]}>
              {withinDays}
              <Text style={styles.tileValueDim}> / {stats.length}</Text>
            </Text>
            <Text style={styles.tileLabel}>{s.onTargetDays}</Text>
          </Tile>
          <Tile bg={colors.accentTint}>
            <Text style={[styles.tileValue, { color: colors.accent }]}>
              {cur}
              {totalSaved.toFixed(0)}
            </Text>
            <Text style={styles.tileLabel}>{s.saved}</Text>
          </Tile>
          <Tile bg={colors.surfaceHigh}>
            <View style={styles.weekTop}>
              <Text style={styles.tileValue}>{weekNow}</Text>
              <MaterialIcons name={deltaIcon} size={20} color={deltaColor} />
            </View>
            <Text style={styles.tileLabel}>{s.thisWeek}</Text>
            <Text style={[styles.deltaText, { color: deltaColor }]} numberOfLines={1}>
              {deltaText}
            </Text>
          </Tile>
        </View>

        {/* Cigs vs limit */}
        <Wide bg={colors.surface}>
          <Text style={styles.tileTitle}>{s.cigsVsLimit}</Text>
          <View style={{ marginTop: spacing.md }}>
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
        </Wide>

        {/* Time of day */}
        <Wide bg={colors.surfaceHigh}>
          <Text style={styles.tileTitle}>{s.whenYouSmoke}</Text>
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
        </Wide>

        {/* Money saved */}
        <Wide bg={colors.surface}>
          <Text style={styles.tileTitle}>{s.moneySaved}</Text>
          <Text style={styles.sub}>{s.baselineNote(settings.baselinePerDay)}</Text>
          <View style={{ marginTop: spacing.md }}>
            <LineChart
              series={[{ points: savings.map((p) => p.saved), color: colors.accent, fill: true }]}
              xLabels={savings.map((p) => `${p.day.getDate()}/${p.day.getMonth() + 1}`)}
              formatY={(v) => `${cur}${Math.round(v)}`}
            />
          </View>
        </Wide>

        {/* Spend summary */}
        <Wide bg={colors.surfaceHigh} style={styles.spendRow}>
          <MaterialIcons name="payments" size={22} color={colors.textDim} />
          <Text style={styles.spendText}>
            {s.spentSummary(cur, totalSpent(purchases).toFixed(0), totalCigarettesBought(purchases))}
          </Text>
        </Wide>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({ children, bg }: { children: ReactNode; bg: string }) {
  return <View style={[styles.tile, { backgroundColor: bg }]}>{children}</View>;
}

function Wide({ children, bg, style }: { children: ReactNode; bg: string; style?: object }) {
  return <View style={[styles.wide, { backgroundColor: bg }, style]}>{children}</View>;
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
  title: { color: colors.text, fontSize: 22, fontFamily: fonts.bold, marginBottom: spacing.md, textAlign: textStart },
  rangeRow: { flexDirection: "row", gap: GAP, marginBottom: GAP },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  tile: {
    flexBasis: "48%",
    flexGrow: 1,
    borderRadius: 0,
    padding: spacing.lg,
    minHeight: 92,
    justifyContent: "center",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tileValue: { color: colors.text, fontSize: 26, fontFamily: fonts.monoSemibold, textAlign: textStart },
  tileValueDim: { color: colors.textDim, fontSize: 18, fontFamily: fonts.mono },
  tileLabel: { color: colors.textDim, fontSize: 12, fontFamily: fonts.regular, marginTop: 2, textAlign: textStart },
  weekTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  deltaText: { fontSize: 12, fontFamily: fonts.semibold, marginTop: 2, textAlign: textStart },

  wide: {
    borderRadius: 0,
    padding: spacing.lg,
    marginTop: GAP,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tileTitle: { color: colors.text, fontSize: 16, fontFamily: fonts.bold, textAlign: textStart },
  sub: { color: colors.textDim, fontSize: 12, fontFamily: fonts.regular, marginTop: spacing.xs, textAlign: textStart },
  legend: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: colors.textDim, fontSize: 12, fontFamily: fonts.regular },
  histRow: { flexDirection: "row", alignItems: "flex-end", height: 56, marginTop: spacing.md },
  ticks: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  tick: { color: colors.textDim, fontSize: 10, fontFamily: fonts.regular },
  spendRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  spendText: { color: colors.textDim, flex: 1, fontFamily: fonts.regular },
});
