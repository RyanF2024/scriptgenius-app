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
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ paymentMethods: [] });
    }

    // List all payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: 'card',
    });

    return NextResponse.json({ paymentMethods: paymentMethods.data });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get or create customer in Stripe
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', session.user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: profile?.email || session.user.email!,
        metadata: {
          userId: session.user.id,
        },
      });

      // Save the customer ID to the user's profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', session.user.id);

      customerId = customer.id;
    }

    // Create a SetupIntent for adding a new payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
