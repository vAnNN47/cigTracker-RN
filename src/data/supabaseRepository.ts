/**
 * Supabase implementation of Repository — ported from
 * lib/data/supabase_repository.dart. Row ownership + the diary edit-lock are
 * enforced by RLS; this just maps rows. Schema:
 *   smoke_logs(id, user_id, smoked_at, log_date, comment, diary)
 *   daily_limits(id, user_id, daily_max, effective_from)
 *   purchases(id, user_id, unit, quantity, price, bought_at)
 *   profiles(id, currency, price_per_pack, baseline_per_day, day_start_hour)
 */
import { supabase } from "@/lib/supabase";
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

async function requireUid(): Promise<string> {
  const { data } = await supabase.auth.getSession(); // cached/local, no network
  const id = data.session?.user.id;
  if (!id) throw new Error("Not signed in");
  return id;
}

/** "YYYY-MM-DD" (local day key) for a date. */
function dateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a "YYYY-MM-DD" (or ISO) date string to LOCAL midnight. */
function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToLog = (r: any): SmokeLog => ({
  id: r.id,
  tag: r.tag ?? DEFAULT_TAG,
  smokedAt: new Date(r.smoked_at),
  comment: r.comment ?? "",
  diary: r.diary ?? "",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToPurchase = (r: any): Purchase => ({
  id: r.id,
  unit: r.unit,
  quantity: r.quantity,
  price: Number(r.price),
  boughtAt: new Date(r.bought_at),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToLimit = (r: any): DailyLimit => ({
  id: r.id,
  limit: r.daily_max,
  effectiveFrom: parseDateOnly(r.effective_from),
});

export class SupabaseRepository implements Repository {
  async getLogs(): Promise<SmokeLog[]> {
    const { data, error } = await supabase.from("smoke_logs").select().order("smoked_at");
    if (error) throw error;
    return (data ?? []).map(rowToLog);
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
    const user_id = await requireUid();
    // Omitting smoked_at uses the DB default now(); log_date is derived from
    // smoked_at server-side, so a custom (earlier-today) time lands correctly.
    const { data, error } = await supabase
      .from("smoke_logs")
      .insert({ user_id, tag, comment, diary, ...(smokedAt ? { smoked_at: smokedAt.toISOString() } : {}) })
      .select()
      .single();
    if (error) throw error;
    return rowToLog(data);
  }

  async updateLog(
    id: string,
    { tag, comment, diary, smokedAt }: { tag?: LocationTag; comment?: string; diary?: string; smokedAt?: Date },
  ): Promise<SmokeLog> {
    const patch: Record<string, string> = {};
    if (tag !== undefined) patch.tag = tag;
    if (comment !== undefined) patch.comment = comment;
    if (diary !== undefined) patch.diary = diary;
    // log_date is derived from smoked_at server-side, so changing the time
    // re-buckets the entry to the correct day automatically.
    if (smokedAt !== undefined) patch.smoked_at = smokedAt.toISOString();
    const { data, error } = await supabase.from("smoke_logs").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return rowToLog(data);
  }

  async deleteLog(id: string): Promise<void> {
    const { error } = await supabase.from("smoke_logs").delete().eq("id", id);
    if (error) throw error;
  }

  async getLimits(): Promise<DailyLimit[]> {
    const { data, error } = await supabase.from("daily_limits").select().order("effective_from");
    if (error) throw error;
    return (data ?? []).map(rowToLimit);
  }

  async setLimit(limit: number, effectiveFrom: Date): Promise<DailyLimit> {
    const user_id = await requireUid();
    const { data, error } = await supabase
      .from("daily_limits")
      .upsert(
        { user_id, daily_max: limit, effective_from: dateOnly(effectiveFrom) },
        { onConflict: "user_id,effective_from" },
      )
      .select()
      .single();
    if (error) throw error;
    return rowToLimit(data);
  }

  async getPurchases(): Promise<Purchase[]> {
    const { data, error } = await supabase.from("purchases").select().order("bought_at");
    if (error) throw error;
    return (data ?? []).map(rowToPurchase);
  }

  async addPurchase(p: Purchase): Promise<Purchase> {
    const user_id = await requireUid();
    const { data, error } = await supabase
      .from("purchases")
      .insert({
        user_id,
        unit: p.unit,
        quantity: p.quantity,
        price: p.price,
        bought_at: p.boughtAt.toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return rowToPurchase(data);
  }

  async updatePurchase(
    id: string,
    { unit, quantity, price, boughtAt }: { unit?: PackUnit; quantity?: number; price?: number; boughtAt?: Date },
  ): Promise<Purchase> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {};
    if (unit !== undefined) patch.unit = unit;
    if (quantity !== undefined) patch.quantity = quantity;
    if (price !== undefined) patch.price = price;
    if (boughtAt !== undefined) patch.bought_at = boughtAt.toISOString();
    const { data, error } = await supabase.from("purchases").update(patch).eq("id", id).select().single();
    if (error) throw error;
    return rowToPurchase(data);
  }

  async deletePurchase(id: string): Promise<void> {
    const { error } = await supabase.from("purchases").delete().eq("id", id);
    if (error) throw error;
  }

  async getSettings(): Promise<AppSettings> {
    const uid = await requireUid();
    const { data, error } = await supabase.from("profiles").select().eq("id", uid).maybeSingle();
    if (error) throw error;
    if (!data) return { ...DEFAULT_SETTINGS };
    return {
      currencySymbol: data.currency ?? "₪",
      pricePerPack: data.price_per_pack != null ? Number(data.price_per_pack) : 35,
      baselinePerDay: data.baseline_per_day ?? 20,
      dayStartHour: data.day_start_hour ?? 4,
      // Defaults to false (count up) for rows that predate the count_down column.
      countDown: data.count_down ?? false,
    };
  }

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    const id = await requireUid();
    const { error } = await supabase.from("profiles").upsert({
      id,
      currency: settings.currencySymbol,
      price_per_pack: settings.pricePerPack,
      baseline_per_day: settings.baselinePerDay,
      day_start_hour: settings.dayStartHour,
      count_down: settings.countDown,
    });
    if (error) throw error;
    return settings;
  }
}
