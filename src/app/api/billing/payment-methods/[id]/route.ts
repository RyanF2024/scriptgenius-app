import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: paymentMethodId } = params;
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
      return new NextResponse('Customer not found', { status: 404 });
    }

    // Attach the payment method to the customer and set as default
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: profile.stripe_customer_id,
    });

    // Set as default payment method
    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.error('Error setting default payment method:', error);
    return new NextResponse(
      error.message || 'Internal Server Error',
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: paymentMethodId } = params;
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
      return new NextResponse('Customer not found', { status: 404 });
    }

    // Get the payment method to check if it's the default
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    if (paymentMethod.customer !== profile.stripe_customer_id) {
      return new NextResponse('Payment method not found', { status: 404 });
    }

    // Check if this is the default payment method
    const customer = await stripe.customers.retrieve(profile.stripe_customer_id);
    if (customer.invoice_settings?.default_payment_method === paymentMethodId) {
      return new NextResponse('Cannot remove default payment method', { status: 400 });
    }

    // Detach the payment method from the customer
    await stripe.paymentMethods.detach(paymentMethodId);

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error removing payment method:', error);
    return new NextResponse(
      error.message || 'Internal Server Error',
      { status: 500 }
    );
  }
}
