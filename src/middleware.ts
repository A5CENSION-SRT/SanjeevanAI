import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/check',
  '/api/auth/logout',
  '/api/mock-current-patients',
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip authentication for public paths and static assets
  if (publicPaths.some(publicPath => path === publicPath) || 
      path.startsWith('/_next/') || 
      path.includes('favicon.ico') ||
      path.startsWith('/uploads/') ||
      path.endsWith('.png') ||
      path.endsWith('.jpg') ||
      path.endsWith('.svg') ||
      path.endsWith('.ico') ||
      (path.startsWith('/api/') && !path.startsWith('/api/consultations/'))) {
    return NextResponse.next();
  }

  // Check if user is logged in by simply checking for token presence
  // The actual verification happens in the API routes which run in Node.js
  const token = request.cookies.get('doctor_token')?.value;
  
  if (!token) {
    console.log(`Middleware: No token found, redirecting from ${path} to login`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // We no longer verify the JWT token here to avoid Edge runtime issues
  // The auth check API endpoint will verify the token when needed
  return NextResponse.next();
}

// Configure the paths the middleware runs on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 