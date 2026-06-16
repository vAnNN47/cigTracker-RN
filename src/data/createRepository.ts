/**
 * Single place that decides which Repository implementation the app uses,
 * based on the USE_SUPABASE flag. The store calls this once.
 */
import { USE_SUPABASE } from "@/lib/config";

import { InMemoryRepository } from "./inMemoryRepository";
import { Repository } from "./repository";
// import { SupabaseRepository } from "./supabaseRepository"; // wired in Step 5

export function createRepository(): Repository {
  if (USE_SUPABASE) {
    // return new SupabaseRepository();
    throw new Error("Supabase repository is wired in Step 5 — keep USE_SUPABASE=false for now.");
  }
  return new InMemoryRepository();
}
