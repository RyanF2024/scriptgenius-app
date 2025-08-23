import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define the subscription requirements for each route
const ROUTE_REQUIREMENTS: Record<string, { plan: string }> = {
  '/app/analytics': { plan: 'pro' },
  '/app/team': { plan: 'pro' },
  '/app/export': { plan: 'studio' },
  '/api/ai': { plan: 'free' }, // All paid plans have AI access
};

export async function withSubscriptionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path requires a subscription
  const routeConfig = Object.entries(ROUTE_REQUIREMENTS).find(([path]) => 
    pathname.startsWith(path)
  )?.[1];

  // If no subscription required for this route, continue
  if (!routeConfig) return NextResponse.next();

  try {
    // Get the session JWT from the request cookies
    const token = await getToken({ req: request });
    
    // If no session, redirect to sign-in
    if (!token?.sub) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Get the user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', token.sub)
      .in('status', ['active', 'trialing'])
      .single();

    // If no active subscription, redirect to pricing
    if (error || !subscription) {
      const url = new URL('/pricing', request.url);
      url.searchParams.set('upgrade', 'true');
      return NextResponse.redirect(url);
    }

    // Check if the user's plan meets the requirement
    const planHierarchy: Record<string, number> = {
      'free': 0,
      'pro': 1,
      'studio': 2,
    };

    const userPlanLevel = planHierarchy[subscription.plan_id] || 0;
    const requiredPlanLevel = planHierarchy[routeConfig.plan] || 0;

    if (userPlanLevel < requiredPlanLevel) {
      const url = new URL('/pricing', request.url);
      url.searchParams.set('upgrade', 'true');
      return NextResponse.redirect(url);
    }

    // User has required subscription, continue
    return NextResponse.next();
  } catch (error) {
    console.error('Subscription middleware error:', error);
    // On error, allow access but log the issue
    return NextResponse.next();
  }
}
