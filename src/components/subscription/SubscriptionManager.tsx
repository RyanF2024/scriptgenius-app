'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    current_period_end: string;
    plan: {
      id: string;
      name: string;
      price_monthly: number;
      price_yearly: number;
      credits_included: number;
    };
  } | null;
  credits: {
    balance: number;
  };
  usage: {
    used: number;
    total: number;
  };
}

export function SubscriptionManager() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscriptionData();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (!response.ok) throw new Error('Failed to fetch subscription data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setIsCanceling(true);
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      await fetchSubscriptionData();
      toast.success('Your subscription has been canceled. You will retain access until the end of your billing period.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsReactivating(true);
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reactivate subscription');
      }

      await fetchSubscriptionData();
      toast.success('Your subscription has been reactivated!');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error(error.message || 'Failed to reactivate subscription');
    } finally {
      setIsReactivating(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/subscription/update-payment-method', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update payment method');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error(error.message || 'Failed to update payment method');
      setIsUpdating(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Sign in to view your subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/auth/signin'}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Unable to load subscription information</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={fetchSubscriptionData}>
            <Icons.refresh className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { subscription, credits, usage } = data;
  const isActive = subscription?.status === 'active';
  const isCanceled = subscription?.status === 'canceled';
  const isTrialing = subscription?.status === 'trialing';
  const isPastDue = subscription?.status === 'past_due';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                {subscription 
                  ? `You're currently on the ${subscription.plan.name} plan`
                  : 'You don\'t have an active subscription'}
              </CardDescription>
            </div>
            {subscription && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isActive ? 'bg-green-100 text-green-800' :
                isCanceled ? 'bg-yellow-100 text-yellow-800' :
                isPastDue ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {isActive ? 'Active' : 
                 isCanceled ? 'Canceled' : 
                 isTrialing ? 'Trial' : 
                 isPastDue ? 'Past Due' : 
                 'Inactive'}
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {subscription && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Billing Cycle</h4>
                <p className="mt-1">
                  {subscription.plan.price_yearly > 0 ? 'Annual' : 'Monthly'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  {isCanceled ? 'Ends on' : 'Next Billing Date'}
                </h4>
                <p className="mt-1">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Price</h4>
                <p className="mt-1">
                  ${subscription.plan.price_monthly}/month
                  {subscription.plan.price_yearly > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      (${subscription.plan.price_yearly}/year)
                    </span>
                  )}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Credits</h4>
                <p className="mt-1">
                  {credits?.balance.toLocaleString()} / {subscription.plan.credits_included.toLocaleString()} used
                </p>
                <Progress 
                  value={(credits?.balance / subscription.plan.credits_included) * 100} 
                  className="mt-2 h-2"
                />
              </div>
            </div>
          )}

          {!subscription && (
            <div className="text-center py-8">
              <Icons.creditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subscription</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by subscribing to a plan.</p>
              <div className="mt-6">
                <Button onClick={() => window.location.href = '/pricing'}>
                  View Plans
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          {subscription && (
            <>
              {isActive && (
                <Button 
                  variant="outline" 
                  onClick={handleUpdatePaymentMethod}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.creditCard className="mr-2 h-4 w-4" />
                  )}
                  Update Payment Method
                </Button>
              )}
              
              {isActive ? (
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                >
                  {isCanceling ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.xCircle className="mr-2 h-4 w-4" />
                  )}
                  Cancel Subscription
                </Button>
              ) : isCanceled ? (
                <Button 
                  onClick={handleReactivateSubscription}
                  disabled={isReactivating}
                >
                  {isReactivating ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.refresh className="mr-2 h-4 w-4" />
                  )}
                  Reactivate Subscription
                </Button>
              ) : (
                <Button onClick={() => window.location.href = '/pricing'}>
                  <Icons.arrowRight className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Your current usage for this billing period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Scripts Analyzed</span>
              <span>{usage.used} / {usage.total || '∞'}</span>
            </div>
            <Progress 
              value={(usage.used / (usage.total || 1)) * 100} 
              className="mt-2 h-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Credits Remaining</span>
              <span>{credits?.balance.toLocaleString()}</span>
            </div>
            <Progress 
              value={subscription ? (credits?.balance / subscription.plan.credits_included) * 100 : 0} 
              className="mt-2 h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
