import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for the admin page
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    // Check for admin session
    const isAdmin = request.cookies.get('admin')?.value === 'true';
    
    // If not admin and not on login page, redirect to login
    if (!isAdmin && !request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}; 