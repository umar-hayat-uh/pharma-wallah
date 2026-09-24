import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * FIX: the original list included '/leaderboard', which redirected every
 * anonymous spectator to /signin — a public science fair leaderboard
 * cannot require login. Only truly admin/user-account routes stay gated.
 * Tournament play/games pages are intentionally public: participants use
 * an entry code, not an account.
 */
const PROTECTED_PATHS = [
  '/dashboard',
  '/api/progress',
  '/admin',
  '/api/reviews',
];

export async function middleware(request: NextRequest) {
  /* ── Hostname-based subdomain detection ─────────────────────────── */
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || '';
  const isClinical = host.startsWith('clinical.');

  // Forwarded to server components as request headers. `x-pathname` lets the
  // root layout give every page its own title, description and canonical
  // (src/lib/seo.ts) — most pages are client components and cannot export
  // metadata themselves.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  if (isClinical) {
    // Set a request header so layout.tsx / page.tsx can read it server-side
    requestHeaders.set('x-subdomain', 'clinical');
  } else {
    // Never trust a client-sent value.
    requestHeaders.delete('x-subdomain');
  }

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  if (isClinical) response.headers.set('x-subdomain', 'clinical');
  /* ── End subdomain detection ────────────────────────────────────── */

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const responseCookie = response.cookies.get(name);
          if (responseCookie) return responseCookie.value;
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
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
    }
  );

  /*
   * A signed-in student who opens the student landing page (`/`) goes straight
   * to their dashboard — the landing page is a pitch they no longer need.
   *
   * This keeps the "only call Supabase when it matters" rule below: the
   * network `getUser()` runs only when a Supabase auth cookie is present, so
   * anonymous visitors and crawlers (no cookie) pay nothing. The clinical
   * subdomain's `/` is a different product and is left alone. Any auth error
   * fails open — the visitor simply sees the landing page.
   */
  if (!isClinical && request.nextUrl.pathname === '/' && hasSupabaseAuthCookie(request)) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const redirect = NextResponse.redirect(new URL('/dashboard', request.url));
        // Carry any refreshed session cookies across the redirect.
        response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
        return redirect;
      }
    } catch (err) {
      console.error('Middleware landing redirect check failed:', err);
    }
  }

  try {
    const pathname = request.nextUrl.pathname;
    const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));

    // Only bother calling Supabase auth at all if the path is protected —
    // saves a network round trip on every public tournament page request.
    if (isProtected) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        const redirectUrl = new URL('/signin', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (err) {
    console.error('Middleware auth error:', err);
    const redirectUrl = new URL('/signin', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

/** @supabase/ssr stores the session as `sb-<project-ref>-auth-token`, chunked as `.0`, `.1`… when large. */
function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};