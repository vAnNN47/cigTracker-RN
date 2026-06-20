/**
 * On-device persistent repo (the "use without an account" mode).
 *
 * Implements the same Repository contract as the in-memory and Supabase repos,
 * but persists everything to AsyncStorage as JSON so data survives app restarts.
 * Data is loaded once into an in-memory cache on first access, then every write
 * mutates the cache and re-persists the affected collection.
 *
 * Dates are stored as ISO strings and revived with `new Date(...)`.
 *
 * No seed data — a brand-new local user starts empty and goes through
 * onboarding (set a daily limit), exactly like a fresh signed-in account.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";

import { isSameDay, keyOf } from "@/domain/day";
import {
  AppSettings,
  DailyLimit,
  DEFAULT_SETTINGS,
  DEFAULT_TAG,
  LocationTag,
  PackUnit,
  Purchase,
  SmokeLog,
} from "@/models";

import { Repository } from "./repository";

const K = {
  logs: "cigtracker.local.logs",
  limits: "cigtracker.local.limits",
  purchases: "cigtracker.local.purchases",
  settings: "cigtracker.local.settings",
} as const;

// ---- (de)serialization helpers ------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parse = <T,>(raw: string | null, fallback: T): any => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reviveLog = (r: any): SmokeLog => ({
  id: r.id,
  tag: r.tag ?? DEFAULT_TAG, // older entries had no location
  smokedAt: new Date(r.smokedAt),
  comment: r.comment ?? "",
  diary: r.diary ?? "",
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reviveLimit = (r: any): DailyLimit => ({
  id: r.id,
  limit: r.limit,
  effectiveFrom: new Date(r.effectiveFrom),
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const revivePurchase = (r: any): Purchase => ({
  id: r.id,
  unit: r.unit,
  quantity: r.quantity,
  price: r.price,
  boughtAt: new Date(r.boughtAt),
});

export class AsyncStorageRepository implements Repository {
  private logs: SmokeLog[] = [];
  private limits: DailyLimit[] = [];
  private purchases: Purchase[] = [];
  private settings: AppSettings = { ...DEFAULT_SETTINGS };
  private loaded = false;
  private loading: Promise<void> | null = null;

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    if (this.loading) return this.loading;
    this.loading = (async () => {
      const entries = await AsyncStorage.multiGet([K.logs, K.limits, K.purchases, K.settings]);
      const map = Object.fromEntries(entries);
      this.logs = parse<unknown[]>(map[K.logs], []).map(reviveLog);
      this.limits = parse<unknown[]>(map[K.limits], []).map(reviveLimit);
      this.purchases = parse<unknown[]>(map[K.purchases], []).map(revivePurchase);
      this.settings = { ...DEFAULT_SETTINGS, ...parse<Partial<AppSettings>>(map[K.settings], {}) };
      this.loaded = true;
    })();
    return this.loading;
  }

  private persistLogs() {
    return AsyncStorage.setItem(K.logs, JSON.stringify(this.logs));
  }
  private persistLimits() {
    return AsyncStorage.setItem(K.limits, JSON.stringify(this.limits));
  }
  private persistPurchases() {
    return AsyncStorage.setItem(K.purchases, JSON.stringify(this.purchases));
  }
  private persistSettings() {
    return AsyncStorage.setItem(K.settings, JSON.stringify(this.settings));
  }

  async getLogs(): Promise<SmokeLog[]> {
    await this.ensureLoaded();
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
    await this.ensureLoaded();
    const log: SmokeLog = { id: randomUUID(), tag, smokedAt: smokedAt ?? new Date(), comment, diary };
    this.logs.push(log);
    await this.persistLogs();
    return log;
  }

  async updateLog(
    id: string,
    { tag, comment, diary, smokedAt }: { tag?: LocationTag; comment?: string; diary?: string; smokedAt?: Date },
  ): Promise<SmokeLog> {
    await this.ensureLoaded();
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
    await this.persistLogs();
    return updated;
  }

  async deleteLog(id: string): Promise<void> {
    await this.ensureLoaded();
    this.logs = this.logs.filter((l) => l.id !== id);
    await this.persistLogs();
  }

  async getLimits(): Promise<DailyLimit[]> {
    await this.ensureLoaded();
    return [...this.limits].sort((a, b) => a.effectiveFrom.getTime() - b.effectiveFrom.getTime());
  }

  async setLimit(limit: number, effectiveFrom: Date): Promise<DailyLimit> {
    await this.ensureLoaded();
    const day = keyOf(effectiveFrom);
    this.limits = this.limits.filter((l) => !isSameDay(l.effectiveFrom, day));
    const dl: DailyLimit = { id: randomUUID(), limit, effectiveFrom: day };
    this.limits.push(dl);
    await this.persistLimits();
    return dl;
  }

  async getPurchases(): Promise<Purchase[]> {
    await this.ensureLoaded();
    return [...this.purchases].sort((a, b) => a.boughtAt.getTime() - b.boughtAt.getTime());
  }

  async addPurchase(purchase: Purchase): Promise<Purchase> {
    await this.ensureLoaded();
    this.purchases.push(purchase);
    await this.persistPurchases();
    return purchase;
  }

  async updatePurchase(
    id: string,
    { unit, quantity, price, boughtAt }: { unit?: PackUnit; quantity?: number; price?: number; boughtAt?: Date },
  ): Promise<Purchase> {
    await this.ensureLoaded();
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
    await this.persistPurchases();
    return updated;
  }

  async deletePurchase(id: string): Promise<void> {
    await this.ensureLoaded();
    this.purchases = this.purchases.filter((p) => p.id !== id);
    await this.persistPurchases();
  }

  async getSettings(): Promise<AppSettings> {
    await this.ensureLoaded();
    return this.settings;
  }

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    await this.ensureLoaded();
    this.settings = settings;
    await this.persistSettings();
    return this.settings;
  }
}
