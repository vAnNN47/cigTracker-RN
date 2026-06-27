/**
 * Progress — v2 light/green theme. Hairline-separated metric cells, mono numbers,
 * uppercase eyebrow section labels, and the react-native-svg charts (now told to
 * draw light gridlines/labels). The week-over-week delta only shows when there
 * was a tracked previous week, so it never claims "more than last week" against a
 * week that simply had no data.
 */
import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { LineChart } from "@/components/charts/LineChart";
import { TabHeader } from "@/components/ui/TabHeader";
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
import { useColors } from "@/theme";
import { Pressable, ScrollView, Text, View } from "@/tw";

const RANGES: { key: string; value: number | null }[] = [
  { key: "7d", value: 7 },
  { key: "30d", value: 30 },
  { key: "All", value: null },
];

/** Stats tab: headline metrics, trend/savings line charts, and hourly histogram. */
export default function ProgressScreen() {
  const s = useStrings();
  const green = useColors();
  // Select only the slices this screen reads (shallow-compared) so an unrelated
  // store write doesn't re-render the charts.
  const { logs, limits, purchases, settings } = useAppStore(
    useShallow((st) => ({ logs: st.logs, limits: st.limits, purchases: st.purchases, settings: st.settings })),
  );
  const dsh = settings.dayStartHour;
  const cur = settings.currencySymbol;

  const [range, setRange] = useState<number | null>(30);

  // Each series is an O(logs) sweep — memoize so they only recompute when the
  // underlying data or the selected range changes, not on every render.
  const stats = useMemo(() => dailyStats(logs, limits, settings, range ?? undefined), [logs, limits, settings, range]);
  const savings = useMemo(() => savingsSeries(logs, limits, settings, range ?? undefined), [logs, limits, settings, range]);
  const histogram = useMemo(() => hourlyHistogram(logs, dsh, range ?? undefined), [logs, dsh, range]);

  const withinDays = stats.filter(withinLimit).length;
  const avg = stats.length ? stats.reduce((a, st) => a + st.count, 0) / stats.length : 0;
  const totalSaved = savings.length ? savings[savings.length - 1].saved : 0;

  const today = logicalToday(dsh);
  const weekNow = countBetween(logs, addDays(today, -6), today, dsh);
  const weekPrev = countBetween(logs, addDays(today, -13), addDays(today, -7), dsh);
  // Only compare when the previous week actually had tracked data.
  const showDelta = weekPrev > 0;
  const delta = weekNow - weekPrev;
  const deltaColor = delta < 0 ? green.green : delta > 0 ? green.error : green.textDim;
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
        className="flex-1 bg-bg"
        contentContainerClassName="pt-2 px-[22px] pb-6"
        alwaysBounceVertical
        overScrollMode="always"
      >
        {/* Header + range */}
        <Text className="text-text text-[22px] font-bold mb-3" style={{ textAlign: textStart }}>{s.progress}</Text>
        <View className="flex-row gap-2 mb-4">
          {RANGES.map((r) => {
            const sel = range === r.value;
            return (
              <Pressable
                key={r.key}
                onPress={() => setRange(r.value)}
                className={`px-4 py-2 rounded-full ${sel ? "bg-green" : "bg-card-soft"}`}
              >
                <Text className={`${sel ? "text-on-green" : "text-text-dim"} text-[13px] font-semibold`}>{r.key}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Metrics — two hairline-separated rows of two cells */}
        <View className="mb-2">
          <View className="flex-row">
            <Metric value={avg.toFixed(1)} label={s.avgPerDay} />
            <Metric
              value={`${withinDays}`}
              valueSuffix={` / ${stats.length}`}
              valueColor={green.green}
              label={s.onTargetDays}
              divider
            />
          </View>
          <View className="flex-row border-t border-border">
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
          <View className="mt-3">
            <LineChart
              series={[
                { points: stats.map((st) => st.count), color: green.green, fill: true },
                { points: stats.map((st) => st.limit), color: green.textDim, dashed: true },
              ]}
              overMask={stats.map((st) => st.count > st.limit)}
              overColor={green.error}
              xLabels={stats.map((st) => `${st.day.getDate()}/${st.day.getMonth() + 1}`)}
              formatY={(v) => String(Math.round(v))}
              gridColor={green.border}
              labelColor={green.textDim}
            />
          </View>
          <View className="flex-row gap-4 mt-3">
            <Legend color={green.green} label={s.smoked} />
            <Legend color={green.textDim} label={s.limitLabel} />
            <Legend color={green.error} label={s.over} />
          </View>
        </Section>

        {/* Time of day */}
        <Section title={s.whenYouSmoke} sub={histTotal < 3 ? s.notEnoughData : s.peakAround(peakLabel)}>
          <View className="flex-row items-end h-14 mt-3">
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
                    backgroundColor: isPeak ? green.green : green.histSoft,
                  }}
                />
              );
            })}
          </View>
          <View className="flex-row justify-between mt-1.5">
            {["00", "06", "12", "18", "23"].map((t) => (
              <Text key={t} className="text-text-dim text-[10px] font-regular">
                {t}
              </Text>
            ))}
          </View>
        </Section>

        {/* Money saved */}
        <Section title={s.moneySaved} sub={s.baselineNote(settings.baselinePerDay)}>
          <View className="mt-3">
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
        <View className="flex-row items-center gap-3 py-4 border-t border-border">
          <MaterialIcons name="payments" size={20} color={green.textDim} />
          <Text className="text-text-dim flex-1 text-[13px] font-regular" style={{ textAlign: textStart }}>
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
  return (
    <View className={`flex-1 py-3 px-2${divider ? " border-l border-border" : ""}`}>
      <View className="flex-row items-center justify-between">
        <Text
          className="text-text text-[24px] font-mono-semibold"
          style={[{ textAlign: textStart }, valueColor ? { color: valueColor } : null]}
        >
          {value}
          {valueSuffix ? <Text className="text-text-dim text-[16px] font-mono">{valueSuffix}</Text> : null}
        </Text>
        {trailing}
      </View>
      <Text className="text-text-dim text-[12px] font-regular mt-1" style={{ textAlign: textStart }}>{label}</Text>
      {caption ? (
        <Text
          className="text-[11px] font-medium mt-0.5"
          style={[{ textAlign: textStart }, captionColor ? { color: captionColor } : null]}
          numberOfLines={1}
        >
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <View className="py-4 border-t border-border">
      <Text className="text-text-dim text-[12px] uppercase tracking-[1.2px] font-medium" style={{ textAlign: textStart }}>{title}</Text>
      {sub ? <Text className="text-text-dim text-[12px] font-regular mt-1" style={{ textAlign: textStart }}>{sub}</Text> : null}
      {children}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-text-dim text-[12px] font-regular">{label}</Text>
    </View>
  );
}
