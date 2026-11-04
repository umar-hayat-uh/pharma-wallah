import { createBrowserClient } from '@supabase/ssr'
import { isConfigured } from '@/lib/services'
import { unavailableSupabase } from '@/lib/supabase-unavailable'

/**
 * Browser Supabase client. Without the two NEXT_PUBLIC_SUPABASE_* keys it
 * returns a stand-in that reports a signed-out visitor and answers every action
 * with "unavailable at the moment" (src/lib/supabase-unavailable.ts) — the
 * header reads the session on every page, so throwing here broke the whole site.
 */
const realClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export function createClient() {
  if (!isConfigured('supabase')) return unavailableSupabase<ReturnType<typeof realClient>>()
  return realClient()
}
