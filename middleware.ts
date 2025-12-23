// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require admin authentication
const protectedRoutes = [
  '/setup',
  '/admin',
  '/profile',
  '/events',
  '/leaderboard',
  '/sheets',
];

// Routes that are always public (no auth required)
const publicRoutes = [
  '/',
  '/auth',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );

  // Allow API routes to handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow static files
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // If it's a protected route, check for session
  if (isProtectedRoute) {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      // Redirect to sign in
      const signInUrl = new URL('/auth', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // If user is logged in and tries to access /auth, redirect to events
  if (pathname === '/auth') {
    const sessionToken = request.cookies.get('session_token')?.value;
    if (sessionToken) {
      return NextResponse.redirect(new URL('/events', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
