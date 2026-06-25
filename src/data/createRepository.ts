/**
 * Single place that maps a runtime data mode to a Repository implementation.
 *
 *  - "local"    → AsyncStorageRepository (persists on-device, no account)
 *  - "supabase" → SupabaseRepository (cloud, requires Google sign-in)
 *  - null       → InMemoryRepository (placeholder before the user has chosen;
 *                 the welcome screen is shown over it, so it's never really used)
 *
 * The store picks the mode (persisted) and calls this; nothing else needs to
 * know which backend is active.
 */
import { AsyncStorageRepository } from "./asyncStorageRepository";
import { InMemoryRepository } from "./inMemoryRepository";
import { Repository } from "./repository";
import { SupabaseRepository } from "./supabaseRepository";

export type DataMode = "local" | "supabase";

/** Maps a runtime data mode to its Repository implementation. */
export function createRepository(mode: DataMode | null): Repository {
  if (mode === "supabase") return new SupabaseRepository();
  if (mode === "local") return new AsyncStorageRepository();
  return new InMemoryRepository();
}
