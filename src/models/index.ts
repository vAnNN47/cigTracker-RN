/**
 * Domain models — ported from lib/models/*.dart.
 * In TS we use plain types + constants; "copyWith" becomes object spread,
 * and JSON (de)serialization lives in the Supabase repo (Step 5).
 */

export type PackUnit = "pack" | "carton";

/** Where a cigarette was smoked (drives the Stats location breakdown). */
export type LocationTag = "home" | "work" | "car" | "social";

export const LOCATION_TAGS: LocationTag[] = ["home", "work", "car", "social"];
export const DEFAULT_TAG: LocationTag = "home";

/**
 * A single logged cigarette.
 *  - tag     = where it happened (location).
 *  - comment = how it felt — a feeling chip value or free text (same field).
 *  - diary   = optional "anything else about this one" note.
 */
export interface SmokeLog {
  id: string;
  smokedAt: Date; // full local timestamp
  tag: LocationTag;
  comment: string;
  diary: string;
}

/** A purchase, used for spend + savings tracking. */
export interface Purchase {
  id: string;
  unit: PackUnit;
  quantity: number; // number of packs or cartons bought
  price: number; // total price paid
  boughtAt: Date;
}

/** An effective-dated daily limit (we keep the full history). */
export interface DailyLimit {
  id: string;
  limit: number;
  effectiveFrom: Date; // local day key from which this limit applies
}

/** User-tunable settings for cost + savings math. */
export interface AppSettings {
  currencySymbol: string; // '₪' or '$'
  pricePerPack: number;
  baselinePerDay: number; // cigs/day before the app (for savings)
  dayStartHour: number; // 0–23; logs before this hour count to previous day
  countDown: boolean; // Today ring counts remaining allowance down instead of up
}

// Fixed by product definition (matches AppSettings in Dart).
export const CIGARETTES_PER_PACK = 20;
export const PACKS_PER_CARTON = 10;
export const CIGS_PER_CARTON = CIGARETTES_PER_PACK * PACKS_PER_CARTON; // 200

export const DEFAULT_SETTINGS: AppSettings = {
  currencySymbol: "₪",
  pricePerPack: 35,
  baselinePerDay: 20,
  dayStartHour: 4,
  countDown: false,
};

/** Per-cigarette price, used to value savings. */
export const pricePerCigarette = (s: AppSettings): number =>
  s.pricePerPack / CIGARETTES_PER_PACK;

/** Cigarettes contained in a purchase, respecting unit. */
export const cigsInPurchase = (p: Purchase): number =>
  p.unit === "carton" ? p.quantity * CIGS_PER_CARTON : p.quantity * CIGARETTES_PER_PACK;
