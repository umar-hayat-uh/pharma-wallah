import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type CookieOptions } from '@supabase/ssr';
import { isConfigured } from '@/lib/services';
import { unavailableSupabase } from '@/lib/supabase-unavailable';

// ─── Environment ───────────────────────────────────────────────────────────
// Read when a client is created, never at module load (2026-11-04): `next build`
// loads every route module, and a module-scope check made the build need the
// keys. Without them each factory returns a stand-in client that reports a
// signed-out visitor and answers every query with "unavailable at the moment"
// (src/lib/supabase-unavailable.ts), so pages render instead of crashing.
const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// The real clients' exact types, so a stand-in is typed like the client it replaces.
type CookieMethods = {
  get(name: string): string | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  remove(name: string, options: CookieOptions): void;
};
const realServer = (key: string, cookies: CookieMethods) =>
  createServerClient(url(), key, { cookies });
type ServerClient = ReturnType<typeof realServer>;
const realBrowser = () => createBrowserClient(url(), anonKey());

// ─── Browser client (singleton-ish) ────────────────────────────────────────
// createBrowserClient is already optimized; we'll just wrap it.
export function createClient() {
  if (!isConfigured('supabase')) return unavailableSupabase<ReturnType<typeof realBrowser>>();
  return realBrowser();
}

// ─── Server client (for route handlers & server components) ──────────────
export async function createServerSupabaseClient(): Promise<ServerClient> {
  if (!isConfigured('supabase')) return unavailableSupabase<ServerClient>();
  const cookieStore = await cookies();
  return realServer(anonKey(), {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value,
          ...options,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value: '',
          ...options,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
        });
      },
  });
}

// ─── Service‑role client (bypasses RLS, server‑side only) ──────────────
export async function createServiceSupabaseClient(): Promise<ServerClient> {
  if (!isConfigured('supabaseAdmin')) return unavailableSupabase<ServerClient>();
  return realServer(process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      get() { return undefined; },
      set() { },
      remove() { },
  });
}