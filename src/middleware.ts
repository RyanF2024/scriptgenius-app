import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';
import { withSubscriptionMiddleware } from './middleware/subscription';

// Define protected and public routes as readonly arrays
const protectedRoutes = ['/dashboard', '/account', '/billing'] as const;
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/pricing'] as const;

// Type for cookie options
type CookieOptionsType = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, API routes, and auth callback
  const shouldSkip = [
    pathname.startsWith('/_next'),
    pathname.startsWith('/static'),
    pathname.includes('.'),
    pathname.startsWith('/auth/callback'),
    pathname === '/',
    pathname.startsWith('/api/webhooks'), // Skip webhook endpoints
  ].some(Boolean);

  if (shouldSkip) {
    return NextResponse.next();
  }

  // Apply subscription middleware for protected routes
  if (pathname.startsWith('/app') || pathname.startsWith('/api/ai')) {
    return withSubscriptionMiddleware(request);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Validate required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return response;
  }

  // Create a Supabase client with proper TypeScript types
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string): string | undefined {
        return request.cookies.get(name)?.value;
      },
      set({ name, value, ...options }: CookieOptionsType) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  try {
    // Check if the current path is protected or public
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Get the session with proper error handling
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Handle session errors
    if (sessionError) {
      console.error('Session error:', sessionError);
      // Clear invalid session
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
    }

    // Redirect logic for protected routes
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect logic for auth routes when already authenticated
    if (isPublicRoute && session) {
      const redirectTo = request.nextUrl.searchParams.get('redirectedFrom') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Handle API routes if needed
    if (pathname.startsWith('/api/')) {
      // Add API-specific middleware logic here
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} as const;
