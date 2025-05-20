
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'auth-token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to /login and static assets/api routes without auth check
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next/') || // Next.js internals
    pathname.startsWith('/api/') || // API routes
    pathname.startsWith('/static/') || // Static files
    pathname.includes('.') // Generally, files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get(AUTH_COOKIE_NAME);

  if (!authToken || authToken.value !== 'authenticated') {
    // Redirect to login if no valid auth token
    const loginUrl = new URL('/login', request.url);
    // You can add a 'from' query parameter to redirect back after login if desired
    // loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Define paths for which the middleware should run
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * And explicitly exclude /login to avoid redirect loops.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
