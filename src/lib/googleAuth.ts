/**
 * Native Google sign-in (account picker, no browser) -> Supabase.
 * Get a Google ID token from the native SDK, hand it to Supabase
 * signInWithIdToken.
 *
 * configure() runs lazily (on first sign-in / sign-out) instead of at import,
 * so merely importing this module (e.g. for signOut in Settings) can't crash
 * the app. On iOS, native sign-in needs iosClientId — set
 * EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID and add the matching iosUrlScheme to the
 * google-signin config plugin in app.json, then rebuild.
 */
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { supabase } from "./supabase";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  configured = true;
}

/** Native Google sign-in → exchanges the ID token for a Supabase session. */
export async function signInWithGoogle(): Promise<void> {
  ensureConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  // v13+ returns { type, data: { idToken, user } }; older returns { idToken }.
  const r = result as unknown as { data?: { idToken?: string | null }; idToken?: string | null };
  const idToken = r.data?.idToken ?? r.idToken;
  if (!idToken) throw new Error("No ID token returned from Google");
  const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: idToken });
  if (error) throw error;
}

/** Signs out of both Google and Supabase. */
export async function signOut(): Promise<void> {
  ensureConfigured();
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore — still sign out of Supabase
  }
  await supabase.auth.signOut();
}
