/**
 * App-wide config flags.
 *
 * USE_SUPABASE flips the whole data layer between the seeded in-memory repo
 * (demo-first) and the real Supabase backend. Keep it false while building
 * screens; flip to true once the UI feels right and auth is wired (Step 5).
 */
export const USE_SUPABASE = true;
