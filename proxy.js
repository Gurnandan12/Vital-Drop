import { NextResponse } from 'next/server';

/**
 * Next.js 16 Edge Proxy (formerly Middleware)
 * Passes page requests to the client-side React Router SPA,
 * where <ProtectedRoute> manages authentication and demo sessions.
 */
export function proxy(request) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
