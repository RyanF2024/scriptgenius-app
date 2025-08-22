import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      // Add more event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const priceId = subscription.items.data[0].price.id;
  
  // Get the user from the database
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single();

  if (userError || !user) {
    console.error('User not found for customer ID:', customerId);
    return;
  }

  // Update the user's subscription status
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_tier: getTierFromPriceId(priceId),
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating user subscription:', updateError);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const amountPaid = invoice.amount_paid;
  
  // Log the successful payment
  const { error: logError } = await supabase
    .from('activity_logs')
    .insert({
      user_id: customerId,
      action: 'payment_succeeded',
      resource_type: 'invoice',
      resource_id: invoice.id,
      metadata: {
        amount: amountPaid,
        currency: invoice.currency,
        invoice_url: invoice.hosted_invoice_url
      }
    });

  if (logError) {
    console.error('Error logging payment success:', logError);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // Log the failed payment
  const { error: logError } = await supabase
    .from('activity_logs')
    .insert({
      user_id: customerId,
      action: 'payment_failed',
      resource_type: 'invoice',
      resource_id: invoice.id,
      metadata: {
        attempt: invoice.attempt_count,
        next_payment_attempt: invoice.next_payment_attempt
      }
    });

  if (logError) {
    console.error('Error logging payment failure:', logError);
  }
}

// Helper function to map price IDs to subscription tiers
function getTierFromPriceId(priceId: string): string {
  // Add your price ID to tier mapping logic here
  if (priceId.includes('premium')) return 'premium';
  if (priceId.includes('pro')) return 'pro';
  return 'free';
}
