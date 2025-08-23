import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';

const INVOICES_PER_PAGE = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startingAfter = searchParams.get('starting_after');
    
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the customer ID from the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ invoices: [], hasMore: false });
    }

    // List invoices for the customer with pagination
    const invoices = await stripe.invoices.list({
      customer: profile.stripe_customer_id,
      limit: INVOICES_PER_PAGE + 1, // Fetch one extra to determine if there are more
      starting_after: startingAfter || undefined,
    });

    // Check if there are more invoices to load
    const hasMore = invoices.data.length > INVOICES_PER_PAGE;
    const data = hasMore ? invoices.data.slice(0, -1) : invoices.data;

    return NextResponse.json({
      invoices: data,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
