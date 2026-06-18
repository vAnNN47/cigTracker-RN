/**
 * Single place that decides which Repository implementation the app uses,
 * based on the USE_SUPABASE flag. The store calls this once.
 */
import { USE_SUPABASE } from "@/lib/config";

import { InMemoryRepository } from "./inMemoryRepository";
import { Repository } from "./repository";
import { SupabaseRepository } from "./supabaseRepository";

export function createRepository(): Repository {
  if (USE_SUPABASE) return new SupabaseRepository();
  return new InMemoryRepository();
}
