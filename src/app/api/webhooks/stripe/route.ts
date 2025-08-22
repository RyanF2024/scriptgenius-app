import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { SubscriptionService } from '@/lib/services/subscriptionService';

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

  // Handle the event using our subscription service
  try {
    await SubscriptionService.handleWebhookEvent(event);
    
    // Special handling for specific events if needed
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle any post-checkout actions
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.payment_succeeded':
        // These are handled by the subscription service
        break;
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle payment failure (e.g., send notification to user)
        console.log('Payment failed:', invoice.id);
        break;
      }
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

// All subscription handling is now in the SubscriptionService
// async function handleSubscriptionChange(subscription: Stripe.Subscription) {
//   // ...
// }

// Payment handling is now in the SubscriptionService
// async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
//   // ...
// }

// async function handlePaymentFailed(invoice: Stripe.Invoice) {
//   // ...
// }

// Tier mapping is now handled by the subscription service
// function getTierFromPriceId(priceId: string): string {
//   // ...
// }
