import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session.subscription) {
      throw new Error('No subscription found in session');
    }

    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(
      typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription.id,
      {
        expand: ['items.data.price.product'],
      }
    );

    // Get the customer ID
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;

    if (!customerId) {
      throw new Error('No customer ID found in session');
    }

    // Get the user ID from the subscription metadata or find by customer ID
    let userId = subscription.metadata?.userId;
    
    if (!userId) {
      // Try to find user by customer ID
      const { data: user } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();
      
      if (!user) {
        throw new Error('User not found for this subscription');
      }
      
      userId = user.id;
    }

    // Update the subscription in the database
    const { data: subscriptionData, error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        stripe_price_id: subscription.items.data[0].price.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000).toISOString() 
          : null,
        plan_id: subscription.metadata?.planId,
        metadata: subscription,
      })
      .select('*')
      .single();

    if (subError) {
      console.error('Error updating subscription:', subError);
      throw new Error('Failed to update subscription in database');
    }

    // Add initial credits if this is a new subscription
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      const priceId = subscription.items.data[0].price.id;
      
      // Get the plan to determine credits to add
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('credits_included')
        .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
        .single();

      if (plan) {
        // Add credits to user's balance
        await supabase.rpc('add_user_credits', {
          p_user_id: userId,
          p_amount: plan.credits_included,
        });

        // Record the credit transaction
        await supabase.from('credit_transactions').insert({
          user_id: userId,
          amount: plan.credits_included,
          type: 'subscription',
          description: `Initial credits from ${subscriptionData.plan_id} subscription`,
          reference_id: subscription.id,
        });
      }
    }

    // Record the payment in billing history
    const latestInvoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
    
    if (latestInvoice.amount_paid > 0) {
      await supabase.from('billing_history').insert({
        user_id: userId,
        subscription_id: subscription.id,
        invoice_id: latestInvoice.id,
        amount: latestInvoice.amount_paid,
        currency: latestInvoice.currency,
        status: latestInvoice.status,
        invoice_url: latestInvoice.hosted_invoice_url || null,
        period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      subscription: subscriptionData,
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to verify subscription',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
