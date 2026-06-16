/**
 * The data contract the UI depends on — ported from lib/data/repository.dart.
 * The in-memory repo implements it now; the Supabase repo (Step 5) implements
 * the same interface, so no UI/store changes are needed to switch backends.
 */
import { AppSettings, DailyLimit, Purchase, SmokeLog } from "@/models";

export interface Repository {
  getLogs(): Promise<SmokeLog[]>;
  addLog(args: { comment: string; diary: string }): Promise<SmokeLog>;
  updateLog(id: string, args: { comment?: string; diary?: string }): Promise<SmokeLog>;
  deleteLog(id: string): Promise<void>;

  getLimits(): Promise<DailyLimit[]>;
  setLimit(limit: number, effectiveFrom: Date): Promise<DailyLimit>;

  getPurchases(): Promise<Purchase[]>;
  addPurchase(purchase: Purchase): Promise<Purchase>;

  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<AppSettings>;
}
