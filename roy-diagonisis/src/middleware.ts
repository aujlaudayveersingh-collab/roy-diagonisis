// =============================================================================
// Edge middleware — protects /admin routes and refreshes Supabase sessions.
// Unauthenticated or unauthorised requests to /admin (except /admin/login) are
// redirected to the login page. Authorisation (admin/staff role) is also
// re-checked server-side in every admin action, so this is defence in depth.
// =============================================================================
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only guard the admin area.
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next({ request });
  }

  // /admin/login is public.
  if (pathname === '/admin/login') {
    return NextResponse.next({ request });
  }

  // Without Supabase config we can't authenticate — send to login, which will
  // explain how to configure the project.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('reason', 'not-configured');
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session (validates the JWT and updates cookies).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Exclude API routes, static files and images from middleware.
  matcher: ['/admin/:path*'],
};
