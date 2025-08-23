import type { ApiResponse, PaginatedResponse } from './index';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  interval_count: number;
  features: string[];
  is_active: boolean;
  is_most_popular: boolean;
  trial_period_days: number | null;
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: SubscriptionPlan;
  start_date: string;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  ended_at: string | null;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal' | 'other';
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  created: string;
  due_date: string | null;
  paid: boolean;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  lines: {
    id: string;
    amount: number;
    currency: string;
    description: string | null;
    period: {
      start: string;
      end: string;
    };
    plan: {
      id: string;
      name: string;
    };
    quantity: number;
    type: 'subscription' | 'invoiceitem' | 'subscription_threshold';
  }[];
}

export interface BillingPortalSession {
  url: string;
}

// API Response Types
export interface ListPlansResponse extends ApiResponse<SubscriptionPlan[]> {}

export interface GetSubscriptionResponse extends ApiResponse<Subscription> {}

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  coupon?: string;
}

export interface CreateCheckoutSessionResponse extends ApiResponse<{ sessionId: string }> {}

export interface ListPaymentMethodsResponse extends ApiResponse<PaymentMethod[]> {}

export interface ListInvoicesResponse extends ApiResponse<PaginatedResponse<Invoice>> {}

export interface CreateBillingPortalSessionRequest {
  returnUrl: string;
}

export interface CreateBillingPortalSessionResponse extends ApiResponse<BillingPortalSession> {}

export interface UpdateSubscriptionRequest {
  planId: string;
  prorationDate?: number;
  quantity?: number;
  trialEnd?: number | 'now';
  paymentBehavior?: 'allow_incomplete' | 'default_incomplete' | 'pending_if_incomplete' | 'error_if_incomplete';
  promotionCode?: string;
}

export interface CancelSubscriptionRequest {
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;
}

export interface ReactivateSubscriptionResponse extends ApiResponse<Subscription> {}

export interface VerifySubscriptionResponse extends ApiResponse<{
  isActive: boolean;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    interval: string;
  } | null;
}> {}
