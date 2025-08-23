import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  credits_included: number;
  max_scripts?: number;
  max_team_members: number;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  plan?: SubscriptionPlan;
}

export interface UserCredits {
  balance: number;
  last_updated: string;
}

export interface BillingItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description?: string;
  created_at: string;
  invoice_url?: string;
  receipt_url?: string;
}

export class SubscriptionService {
  // Get all available subscription plans
  static async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get current user's subscription
  static async getCurrentSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get user's credit balance
  static async getCreditBalance(userId: string): Promise<UserCredits> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    
    if (!data) {
      // Initialize credits for new users
      const { data: newCredits } = await supabase
        .from('user_credits')
        .insert([{ user_id: userId, balance: 0 }])
        .select()
        .single();
      
      return newCredits || { balance: 0, last_updated: new Date().toISOString() };
    }

    return data;
  }

  // Get billing history
  static async getBillingHistory(userId: string, limit = 10): Promise<BillingItem[]> {
    const { data, error } = await supabase
      .from('billing_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Create a checkout session
  static async createCheckoutSession(
    userId: string,
    planId: string,
    billingInterval: 'month' | 'year'
  ): Promise<{ url: string }> {
    // 1. Get the plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) throw new Error('Plan not found');

    // 2. Get or create Stripe customer
    let customerId: string;
    const { data: user } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (user?.stripe_customer_id) {
      customerId = user.stripe_customer_id;
    } else {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { user_id: userId },
      });

      // Save the customer ID to the user's profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId);

      customerId = customer.id;
    }

    // 3. Create a checkout session
    const priceId = billingInterval === 'year' 
      ? plan.stripe_yearly_price_id 
      : plan.stripe_monthly_price_id;

    if (!priceId) throw new Error('Price not configured for this plan');

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: planId,
        },
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    if (!session.url) throw new Error('Failed to create checkout session');

    return { url: session.url };
  }

  // Handle Stripe webhook events
  static async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.user_id;
    const planId = session.metadata?.plan_id;
    const subscriptionId = session.subscription as string;

    if (!userId || !planId || !subscriptionId) {
      throw new Error('Missing required metadata in checkout session');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const plan = await this.getPlan(planId);

    // Add or update subscription in database
    await supabase.from('user_subscriptions').upsert({
      user_id: userId,
      plan_id: planId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: subscription.items.data[0].price.id,
    });

    // Add included credits to user's balance
    if (plan.credits_included > 0) {
      await this.addCredits(userId, plan.credits_included, 'subscription_credit', {
        subscription_id: subscription.id,
        plan_id: planId,
      });
    }

    // Record in billing history
    await supabase.from('billing_history').insert({
      user_id: userId,
      subscription_id: subscription.id,
      amount: plan.price_monthly, // This will be updated by the invoice.paid webhook
      currency: 'usd',
      status: 'succeeded',
      type: 'subscription',
      description: `Subscription to ${plan.name} plan`,
      invoice_url: session.invoice_url || undefined,
      receipt_url: session.receipt_url || undefined,
    });
  }

  private static async handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    const amountPaid = invoice.amount_paid / 100; // Convert from cents to dollars
    const currency = invoice.currency.toUpperCase();

    // Update billing history with actual amount paid
    await supabase
      .from('billing_history')
      .update({
        amount: amountPaid,
        currency,
        status: 'succeeded',
        invoice_url: invoice.hosted_invoice_url || undefined,
        receipt_url: invoice.receipt_url || undefined,
      })
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false })
      .limit(1);
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.user_id;
    if (!userId) return;

    await supabase
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.user_id;
    if (!userId) return;

    await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  // Add credits to user's balance
  static async addCredits(
    userId: string,
    amount: number,
    type: 'purchase' | 'subscription_credit' | 'refund' | 'bonus',
    metadata: Record<string, any> = {}
  ) {
    // Start a transaction
    const { data: creditData, error: creditError } = await supabase.rpc('add_user_credits', {
      p_user_id: userId,
      p_amount: amount,
    });

    if (creditError) throw creditError;

    // Record the transaction
    const { error: txError } = await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount,
      balance_after: creditData.balance,
      type,
      description: `Added ${amount} credits (${type})`,
      reference_id: metadata.subscription_id || metadata.purchase_id,
      metadata,
    });

    if (txError) throw txError;

    return creditData;
  }

  // Use credits (e.g., for script analysis)
  static async useCredits(
    userId: string,
    amount: number,
    referenceId: string,
    description: string,
    metadata: Record<string, any> = {}
  ) {
    // Start a transaction
    const { data: creditData, error: creditError } = await supabase.rpc('use_user_credits', {
      p_user_id: userId,
      p_amount: amount,
    });

    if (creditError) throw creditError;

    // Record the transaction
    const { error: txError } = await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: -amount,
      balance_after: creditData.balance,
      type: 'usage',
      description,
      reference_id: referenceId,
      metadata,
    });

    if (txError) throw txError;

    return creditData;
  }

  // Check if user has enough credits
  static async hasEnoughCredits(userId: string, required: number): Promise<boolean> {
    const credits = await this.getCreditBalance(userId);
    return credits.balance >= required;
  }

  // Get a single plan by ID
  private static async getPlan(planId: string): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) throw error;
    return data;
  }
}
