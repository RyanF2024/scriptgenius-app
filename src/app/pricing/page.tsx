'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { PlanCard } from '@/components/subscription/PlanCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  credits_included: number;
  max_scripts?: number;
  max_team_members: number;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscription/plans');
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/pricing`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingInterval,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Failed to start checkout process');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
          <p className="text-lg text-gray-600">Choose the plan that's right for you</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[600px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-lg text-gray-600">Choose the plan that's right for you</p>
        
        <div className="mt-8 flex justify-center">
          <Tabs 
            defaultValue="month" 
            className="w-full max-w-md"
            onValueChange={(value) => setBillingInterval(value as 'month' | 'year')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Monthly Billing</TabsTrigger>
              <TabsTrigger value="year">Yearly Billing (Save 20%)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          // Format features for the PlanCard component
          const features = [
            { text: `${plan.credits_included} credits included`, included: true },
            {
              text: plan.max_scripts 
                ? `Up to ${plan.max_scripts} scripts` 
                : 'Unlimited scripts',
              included: true,
            },
            {
              text: `Up to ${plan.max_team_members} team member${plan.max_team_members !== 1 ? 's' : ''}`,
              included: true,
            },
            { text: 'Basic analytics', included: plan.id !== 'free' },
            { text: 'Priority support', included: plan.id === 'pro' || plan.id === 'studio' },
            { text: 'API access', included: plan.id === 'studio' },
          ];

          return (
            <PlanCard
              key={plan.id}
              name={plan.name}
              description={plan.description}
              priceMonthly={plan.price_monthly}
              priceYearly={plan.price_yearly}
              features={features}
              isPopular={plan.id === 'pro'}
              isCurrentPlan={false} // You would check this against the user's current plan
              onSelect={() => handleSelectPlan(plan.id)}
              isLoading={isSubmitting}
              billingInterval={billingInterval}
            />
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>Need a custom plan for your team? <a href="#" className="text-primary hover:underline">Contact us</a></p>
      </div>
    </div>
  );
}
