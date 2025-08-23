import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the customer ID from the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status, plan_name')
      .eq('id', session.user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({
        hasSubscription: false,
        isActive: false,
        plan: null,
      });
    }

    // Get the customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 1,
    });

    const subscription = subscriptions.data[0];
    const isActive = ['active', 'trialing'].includes(subscription?.status || '');

    return NextResponse.json({
      hasSubscription: !!subscription,
      isActive,
      plan: subscription ? {
        id: subscription.items.data[0]?.price.id,
        name: profile.plan_name,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();
    
    if (!priceId) {
      return new NextResponse('Price ID is required', { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get or create customer
    const customerId = await getOrCreateCustomer(session.user.id);

    // Check if user has an active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
    });

    const activeSubscription = subscriptions.data.find(
      (sub) => ['active', 'trialing'].includes(sub.status)
    );

    let checkoutSession;

    if (activeSubscription) {
      // Update existing subscription
      await stripe.subscriptions.update(activeSubscription.id, {
        items: [{
          id: activeSubscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'create_prorations',
      });

      // Return success response
      return NextResponse.json({ 
        success: true,
        message: 'Subscription updated successfully' 
      });
    } else {
      // Create new checkout session for subscription
      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        subscription_data: {
          trial_period_days: 7, // Optional: Add a trial period
        },
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      });

      return NextResponse.json({ sessionId: checkoutSession.id });
    }
  } catch (error) {
    console.error('Error managing subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Helper function to get or create a customer
async function getOrCreateCustomer(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create a new customer in Stripe
  const customer = await stripe.customers.create({
    email: profile?.email,
    metadata: { userId },
  });

  // Save the customer ID to the user's profile
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}
