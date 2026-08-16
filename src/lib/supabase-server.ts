import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type CookieOptions } from '@supabase/ssr';

// ─── Environment validation ────────────────────────────────────────────────
const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// ─── Browser client (singleton-ish) ────────────────────────────────────────
// createBrowserClient is already optimized; we'll just wrap it.
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ─── Server client (for route handlers & server components) ──────────────
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
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
    },
  });
}

// ─── Service‑role client (bypasses RLS, server‑side only) ──────────────
export async function createServiceSupabaseClient() {
  const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      get() { return undefined; },
      set() { },
      remove() { },
    },
  });
}