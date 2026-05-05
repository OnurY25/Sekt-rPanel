import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith('/dashboard');
  const isRoot = pathname === '/';

  let supabaseResponse = NextResponse.next({ request });

  // ── Case 1: Supabase IS configured → use Supabase session ────────────────
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return request.cookies.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            supabaseResponse = NextResponse.next({ request: { headers: request.headers } });
            supabaseResponse.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            supabaseResponse = NextResponse.next({ request: { headers: request.headers } });
            supabaseResponse.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Check our custom cookie as fallback (for demo accounts not in Supabase)
    const hasCustomAuth = request.cookies.get('saas_auth')?.value === '1';
    const isAuthenticated = !!user || hasCustomAuth;

    if (!isAuthenticated && isDashboard) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    if (isAuthenticated && isRoot) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // ── Case 2: No Supabase → use only our custom cookie ─────────────────────
  const hasCustomAuth = request.cookies.get('saas_auth')?.value === '1';

  if (!hasCustomAuth && isDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (hasCustomAuth && isRoot) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
