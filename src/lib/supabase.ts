/**
 * Supabase client for React Native. URL polyfill must be imported first; the
 * session is persisted in AsyncStorage and auto-refreshed. URL + anon key come
 * from EXPO_PUBLIC_* env (see .env), so they're inlined at build time.
 */
import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Shared Supabase client (session persisted in AsyncStorage, auto-refreshed). */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // no URL-based session detection in native
  },
});
