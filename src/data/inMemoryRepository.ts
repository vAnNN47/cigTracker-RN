/**
 * In-memory repo with seeded demo data — ported from
 * lib/data/in_memory_repository.dart. Lets the whole UI be alive before the
 * backend is wired. Data resets on app restart.
 */
import { randomUUID } from "expo-crypto";

import {
  AppSettings,
  DailyLimit,
  DEFAULT_SETTINGS,
  LOCATION_TAGS,
  LocationTag,
  PackUnit,
  Purchase,
  SmokeLog,
} from "@/models";
import { addDays, isSameDay, keyOf, today } from "@/domain/day";

import { Repository } from "./repository";

export class InMemoryRepository implements Repository {
  private logs: SmokeLog[] = [];
  private limits: DailyLimit[] = [];
  private purchases: Purchase[] = [];
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.seed();
  }

  private seed() {
    const t = today();

    // Limit history: started at 20/day, stepped down over ~6 weeks.
    this.limits.push(
      { id: randomUUID(), limit: 20, effectiveFrom: addDays(t, -42) },
      { id: randomUUID(), limit: 15, effectiveFrom: addDays(t, -28) },
      { id: randomUUID(), limit: 10, effectiveFrom: addDays(t, -14) },
      { id: randomUUID(), limit: 7, effectiveFrom: addDays(t, -5) },
    );

    // Smoke logs trending downward, with deterministic noise.
    for (let back = 42; back >= 0; back--) {
      const base = back > 28 ? 19 : back > 14 ? 14 : back > 5 ? 9 : 6;
      const jitter = ((back * 7) % 5) - 2; // -2..2
      const n = Math.min(30, Math.max(0, base + jitter));
      const day = addDays(t, -back);
      for (let i = 0; i < n; i++) {
        this.logs.push({
          id: randomUUID(),
          tag: LOCATION_TAGS[(back + i) % LOCATION_TAGS.length],
          smokedAt: new Date(
            day.getFullYear(),
            day.getMonth(),
            day.getDate(),
            8 + (i % 14),
          ),
          comment: i === 0 ? "morning one" : "",
          diary:
            i === 0 && back <= 1
              ? "Felt the urge after coffee. Held off until later than usual."
              : "",
        });
      }
    }

    // A couple of purchases.
    this.purchases.push(
      { id: randomUUID(), unit: "carton", quantity: 1, price: 72, boughtAt: addDays(t, -30) },
      { id: randomUUID(), unit: "pack", quantity: 3, price: 24, boughtAt: addDays(t, -7) },
    );

    this.settings = { currencySymbol: "₪", pricePerPack: 35, baselinePerDay: 20, dayStartHour: 4, countDown: false };
  }

  async getLogs(): Promise<SmokeLog[]> {
    return [...this.logs];
  }

  async addLog({
    tag,
    comment,
    diary,
    smokedAt,
  }: {
    tag: LocationTag;
    comment: string;
    diary: string;
    smokedAt?: Date;
  }): Promise<SmokeLog> {
    const log: SmokeLog = { id: randomUUID(), tag, smokedAt: smokedAt ?? new Date(), comment, diary };
    this.logs.push(log);
    return log;
  }

  async updateLog(
    id: string,
    { tag, comment, diary, smokedAt }: { tag?: LocationTag; comment?: string; diary?: string; smokedAt?: Date },
  ): Promise<SmokeLog> {
    const i = this.logs.findIndex((l) => l.id === id);
    if (i === -1) throw new Error("log not found");
    const updated: SmokeLog = {
      ...this.logs[i],
      tag: tag ?? this.logs[i].tag,
      comment: comment ?? this.logs[i].comment,
      diary: diary ?? this.logs[i].diary,
      smokedAt: smokedAt ?? this.logs[i].smokedAt,
    };
    this.logs[i] = updated;
    return updated;
  }

  async deleteLog(id: string): Promise<void> {
    this.logs = this.logs.filter((l) => l.id !== id);
  }

  async getLimits(): Promise<DailyLimit[]> {
    return [...this.limits].sort(
      (a, b) => a.effectiveFrom.getTime() - b.effectiveFrom.getTime(),
    );
  }

  async setLimit(limit: number, effectiveFrom: Date): Promise<DailyLimit> {
    const day = keyOf(effectiveFrom);
    this.limits = this.limits.filter((l) => !isSameDay(l.effectiveFrom, day));
    const dl: DailyLimit = { id: randomUUID(), limit, effectiveFrom: day };
    this.limits.push(dl);
    return dl;
  }

  async getPurchases(): Promise<Purchase[]> {
    return [...this.purchases].sort(
      (a, b) => a.boughtAt.getTime() - b.boughtAt.getTime(),
    );
  }

  async addPurchase(purchase: Purchase): Promise<Purchase> {
    this.purchases.push(purchase);
    return purchase;
  }

  async updatePurchase(
    id: string,
    { unit, quantity, price, boughtAt }: { unit?: PackUnit; quantity?: number; price?: number; boughtAt?: Date },
  ): Promise<Purchase> {
    const i = this.purchases.findIndex((p) => p.id === id);
    if (i === -1) throw new Error("purchase not found");
    const updated: Purchase = {
      ...this.purchases[i],
      unit: unit ?? this.purchases[i].unit,
      quantity: quantity ?? this.purchases[i].quantity,
      price: price ?? this.purchases[i].price,
      boughtAt: boughtAt ?? this.purchases[i].boughtAt,
    };
    this.purchases[i] = updated;
    return updated;
  }

  async deletePurchase(id: string): Promise<void> {
    this.purchases = this.purchases.filter((p) => p.id !== id);
  }

  async getSettings(): Promise<AppSettings> {
    return this.settings;
  }

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    this.settings = settings;
    return this.settings;
  }
}
