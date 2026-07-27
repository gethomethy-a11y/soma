import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client.
 *
 * The app is designed to run without it: if the env vars are missing (local dev
 * before you've pasted your keys, or a preview build), every call falls back to
 * browser storage and the UI behaves identically.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null;

let sessionPromise: Promise<string | null> | null = null;

/**
 * Returns the current user id, creating an anonymous session on first launch.
 *
 * Anonymous sign-ins must be enabled in the Supabase dashboard
 * (Authentication → Sign In / Providers → Anonymous sign-ins). If they aren't,
 * this resolves to null and the app stays on local storage instead of failing.
 */
export function ensureSession(): Promise<string | null> {
  if (!supabase) return Promise.resolve(null);
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) return data.session.user.id;

      const { data: signedIn, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn("[soma] Anonymous sign-in failed — falling back to local storage.", error.message);
        return null;
      }
      return signedIn.user?.id ?? null;
    } catch (err) {
      console.warn("[soma] Supabase unreachable — falling back to local storage.", err);
      return null;
    }
  })();

  return sessionPromise;
}
