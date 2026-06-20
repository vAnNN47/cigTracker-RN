/**
 * The data contract the UI depends on — ported from lib/data/repository.dart.
 * The in-memory repo implements it now; the Supabase repo (Step 5) implements
 * the same interface, so no UI/store changes are needed to switch backends.
 */
import { AppSettings, DailyLimit, PackUnit, Purchase, SmokeLog } from "@/models";

export interface Repository {
  getLogs(): Promise<SmokeLog[]>;
  // smokedAt lets the user log a cigarette they smoked earlier (defaults to now).
  addLog(args: { comment: string; diary: string; smokedAt?: Date }): Promise<SmokeLog>;
  // smokedAt lets the user correct the time of an entry logged late.
  updateLog(id: string, args: { comment?: string; diary?: string; smokedAt?: Date }): Promise<SmokeLog>;
  deleteLog(id: string): Promise<void>;

  getLimits(): Promise<DailyLimit[]>;
  setLimit(limit: number, effectiveFrom: Date): Promise<DailyLimit>;

  getPurchases(): Promise<Purchase[]>;
  addPurchase(purchase: Purchase): Promise<Purchase>;
  updatePurchase(
    id: string,
    args: { unit?: PackUnit; quantity?: number; price?: number; boughtAt?: Date },
  ): Promise<Purchase>;
  deletePurchase(id: string): Promise<void>;

  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<AppSettings>;
}
