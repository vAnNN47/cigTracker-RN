/**
 * Native Google sign-in (account picker, no browser) -> Supabase.
 * Get a Google ID token from the native SDK, hand it to Supabase
 * signInWithIdToken. Configure runs once on import.
 */
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { supabase } from "./supabase";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  // v13+ returns { type, data: { idToken, user } }; older returns { idToken }.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idToken = (result as any).data?.idToken ?? (result as any).idToken;
  if (!idToken) throw new Error("No ID token returned from Google");
  const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: idToken });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore — still sign out of Supabase
  }
  await supabase.auth.signOut();
}
