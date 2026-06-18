/**
 * Pure business rules — ported from the methods that lived inside AppState
 * (lib/state/app_state.dart). Keeping them as free functions makes them
 * trivially testable and keeps the Zustand store thin.
 *
 * THE core rule: logical day = the date of (timestamp − dayStartHour).
 * With dayStartHour=4 (default), a 01:00 log counts toward the previous day.
 */
import {
  AppSettings,
  DailyLimit,
  Purchase,
  SmokeLog,
  cigsInPurchase,
  pricePerCigarette,
} from "@/models";

import { addDays, isSameDay, keyOf, range } from "./day";

const HOUR_MS = 60 * 60 * 1000;

/** The logical day a timestamp belongs to, shifted by the day-start hour. */
export function logicalDay(dt: Date, dayStartHour: number): Date {
  return keyOf(new Date(dt.getTime() - dayStartHour * HOUR_MS));
}

export function logicalToday(dayStartHour: number): Date {
  return logicalDay(new Date(), dayStartHour);
}

/** A log/diary is editable only while it belongs to the current logical day. */
export function isLogEditable(log: SmokeLog, dayStartHour: number): boolean {
  return isSameDay(logicalDay(log.smokedAt, dayStartHour), logicalToday(dayStartHour));
}

// ---- Logs -----------------------------------------------------------------

export function logsForDay(logs: SmokeLog[], day: Date, dayStartHour: number): SmokeLog[] {
  const key = keyOf(day);
  return logs
    .filter((l) => isSameDay(logicalDay(l.smokedAt, dayStartHour), key))
    .sort((a, b) => a.smokedAt.getTime() - b.smokedAt.getTime());
}

export function countForDay(logs: SmokeLog[], day: Date, dayStartHour: number): number {
  return logsForDay(logs, day, dayStartHour).length;
}

export function countBetween(
  logs: SmokeLog[],
  fromInclusive: Date,
  toInclusive: Date,
  dayStartHour: number,
): number {
  const f = keyOf(fromInclusive);
  const t = keyOf(toInclusive);
  return logs.filter((l) => {
    const d = logicalDay(l.smokedAt, dayStartHour);
    return d >= f && d <= t;
  }).length;
}

/** Counts per clock-hour (0–23). Window uses logical day; hour stays real. */
export function hourlyHistogram(
  logs: SmokeLog[],
  dayStartHour: number,
  lastDays?: number,
): Record<number, number> {
  const hist: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hist[h] = 0;
  const from =
    lastDays == null ? null : addDays(logicalToday(dayStartHour), -(lastDays - 1));
  for (const l of logs) {
    if (from && logicalDay(l.smokedAt, dayStartHour) < from) continue;
    hist[l.smokedAt.getHours()] += 1;
  }
  return hist;
}

// ---- Limits (effective-dated) ---------------------------------------------

/** Most recent limit whose effectiveFrom ≤ day; falls back to baseline. */
export function limitForDay(
  limits: DailyLimit[],
  day: Date,
  settings: AppSettings,
): number {
  const key = keyOf(day);
  let best: DailyLimit | null = null;
  for (const l of limits) {
    if (l.effectiveFrom <= key) {
      if (best == null || l.effectiveFrom > best.effectiveFrom) best = l;
    }
  }
  return best?.limit ?? settings.baselinePerDay;
}

export function currentLimit(limits: DailyLimit[], settings: AppSettings): number {
  return limitForDay(limits, logicalToday(settings.dayStartHour), settings);
}

// ---- Series for charts -----------------------------------------------------

export interface DayStat {
  day: Date;
  count: number;
  limit: number;
}

export function withinLimit(s: DayStat): boolean {
  return s.count <= s.limit;
}

export function firstTrackedDay(
  logs: SmokeLog[],
  limits: DailyLimit[],
  dayStartHour: number,
): Date {
  const dates: Date[] = [
    ...logs.map((l) => logicalDay(l.smokedAt, dayStartHour)),
    ...limits.map((l) => l.effectiveFrom),
  ];
  if (dates.length === 0) return addDays(logicalToday(dayStartHour), -29);
  dates.sort((a, b) => a.getTime() - b.getTime());
  return dates[0];
}

export function dailyStats(
  logs: SmokeLog[],
  limits: DailyLimit[],
  settings: AppSettings,
  lastDays?: number,
): DayStat[] {
  const today = logicalToday(settings.dayStartHour);
  let from = firstTrackedDay(logs, limits, settings.dayStartHour);
  if (lastDays != null) {
    const cut = addDays(today, -(lastDays - 1));
    if (cut > from) from = cut;
  }
  return range(from, today).map((d) => ({
    day: d,
    count: countForDay(logs, d, settings.dayStartHour),
    limit: limitForDay(limits, d, settings),
  }));
}

// ---- Spend + savings -------------------------------------------------------

export function purchasesForDay(
  purchases: Purchase[],
  day: Date,
  dayStartHour: number,
): Purchase[] {
  const key = keyOf(day);
  return purchases
    .filter((p) => isSameDay(logicalDay(p.boughtAt, dayStartHour), key))
    .sort((a, b) => a.boughtAt.getTime() - b.boughtAt.getTime());
}

export function totalSpent(purchases: Purchase[]): number {
  return purchases.reduce((sum, p) => sum + p.price, 0);
}

export function totalCigarettesBought(purchases: Purchase[]): number {
  return purchases.reduce((sum, p) => sum + cigsInPurchase(p), 0);
}

/** Total amount spent on purchases for one logical day. */
export function spentForDay(
  purchases: Purchase[],
  day: Date,
  dayStartHour: number,
): number {
  return totalSpent(purchasesForDay(purchases, day, dayStartHour));
}

// ---- Headline figures for the Today screen --------------------------------

/**
 * Day streak = consecutive COMPLETED days within limit, ending yesterday.
 * Today is in progress so it doesn't count yet; if yesterday went over the
 * limit the streak is 0 (broken). Walks back from yesterday, stopping at the
 * first over-limit day or before tracking began.
 */
export function currentStreak(
  logs: SmokeLog[],
  limits: DailyLimit[],
  settings: AppSettings,
): number {
  const today = logicalToday(settings.dayStartHour);
  const first = firstTrackedDay(logs, limits, settings.dayStartHour);
  let streak = 0;
  for (let d = addDays(today, -1); d >= first; d = addDays(d, -1)) {
    const count = countForDay(logs, d, settings.dayStartHour);
    const limit = limitForDay(limits, d, settings);
    if (count <= limit) streak += 1;
    else break;
  }
  return streak;
}

/** Mean cigarettes/day over the tracked range (optionally the last N days). */
export function averagePerDay(
  logs: SmokeLog[],
  limits: DailyLimit[],
  settings: AppSettings,
  lastDays?: number,
): number {
  const stats = dailyStats(logs, limits, settings, lastDays);
  if (stats.length === 0) return 0;
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  return Math.round(total / stats.length);
}

/** Cumulative money saved to date (last point of the savings series). */
export function totalSaved(
  logs: SmokeLog[],
  limits: DailyLimit[],
  settings: AppSettings,
): number {
  const series = savingsSeries(logs, limits, settings);
  return series.length ? series[series.length - 1].saved : 0;
}

/**
 * Compare today's count to the average of the previous 7 days (excluding
 * today). diff > 0 means smoking fewer than average (good).
 */
export function sevenDayInsight(
  logs: SmokeLog[],
  settings: AppSettings,
): { diff: number; todayCount: number; average: number } {
  const today = logicalToday(settings.dayStartHour);
  const todayCount = countForDay(logs, today, settings.dayStartHour);
  let sum = 0;
  for (let i = 1; i <= 7; i++) {
    sum += countForDay(logs, addDays(today, -i), settings.dayStartHour);
  }
  const average = sum / 7;
  return { diff: Math.round(average) - todayCount, todayCount, average };
}

/** Cumulative savings series: per day (baseline − actual) × pricePerCig. */
export function savingsSeries(
  logs: SmokeLog[],
  limits: DailyLimit[],
  settings: AppSettings,
  lastDays?: number,
): { day: Date; saved: number }[] {
  const stats = dailyStats(logs, limits, settings, lastDays);
  const perCig = pricePerCigarette(settings);
  let cumulative = 0;
  return stats.map((s) => {
    cumulative += (settings.baselinePerDay - s.count) * perCig;
    return { day: s.day, saved: cumulative };
  });
}
