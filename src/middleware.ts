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
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  /* ── Hostname-based subdomain detection ─────────────────────────── */
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host') || '';
  const isClinical = host.startsWith('clinical.');

  if (isClinical) {
    // Set a request header so layout.tsx / page.tsx can read it server-side
    response.headers.set('x-subdomain', 'clinical');

    // Also forward via request headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-subdomain', 'clinical');

    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set('x-subdomain', 'clinical');
  }
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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};