'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  credits_included: number;
  is_popular?: boolean;
}

interface PlanSelectorProps {
  currentPlanId?: string;
  currentBillingInterval?: 'month' | 'year';
  onPlanSelected?: (planId: string, interval: 'month' | 'year') => void;
  isUpgrading?: boolean;
  className?: string;
}

export function PlanSelector({ 
  currentPlanId, 
  currentBillingInterval = 'month',
  onPlanSelected,
  isUpgrading = false,
  className = ''
}: PlanSelectorProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>(currentBillingInterval);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/billing/plans');
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setPlans(data.plans);
        
        // Auto-select the first plan if none is selected and not in upgrade mode
        if (!currentPlanId && data.plans.length > 0) {
          setSelectedPlanId(data.plans[0].id);
        } else if (currentPlanId) {
          setSelectedPlanId(currentPlanId);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [currentPlanId]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleBillingIntervalChange = (interval: 'month' | 'year') => {
    setBillingInterval(interval);
  };

  const handleContinue = async () => {
    if (!selectedPlanId) return;
    
    if (onPlanSelected) {
      onPlanSelected(selectedPlanId, billingInterval);
      return;
    }

    setIsProcessing(true);
    try {
      // If no handler is provided, default to creating a checkout session
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          billingInterval,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to proceed with subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-1/2 bg-muted rounded mb-4" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-muted rounded-full" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-10 w-full bg-muted rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center justify-center p-1 bg-muted rounded-lg">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              billingInterval === 'month' ? 'bg-background text-foreground shadow' : 'text-muted-foreground'
            }`}
            onClick={() => handleBillingIntervalChange('month')}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              billingInterval === 'year' ? 'bg-background text-foreground shadow' : 'text-muted-foreground'
            }`}
            onClick={() => handleBillingIntervalChange('year')}
          >
            Yearly Billing <span className="text-primary ml-1">(Save 20%)</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              plan.is_popular ? 'border-2 border-primary' : ''
            } ${selectedPlanId === plan.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.is_popular && (
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {selectedPlanId === plan.id && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Icons.check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  {billingInterval === 'month' 
                    ? formatPrice(plan.price_monthly) 
                    : formatPrice(plan.price_yearly)}
                </span>
                <span className="text-muted-foreground">
                  /{billingInterval === 'month' ? 'month' : 'year'}
                </span>
                {billingInterval === 'year' && plan.price_yearly < plan.price_monthly * 12 && (
                  <span className="ml-2 text-sm text-muted-foreground line-through">
                    {formatPrice(plan.price_monthly * 12)}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Icons.check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{plan.credits_included.toLocaleString()} credits included</span>
                </div>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <Icons.check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={selectedPlanId === plan.id ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleContinue();
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentPlanId === plan.id ? (
                  'Current Plan'
                ) : isUpgrading ? (
                  'Upgrade Plan'
                ) : (
                  'Get Started'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Continue Button (for radio group selection) */}
      {!onPlanSelected && selectedPlanId && (
        <div className="mt-8 text-center">
          <Button 
            size="lg" 
            onClick={handleContinue}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isUpgrading ? (
              'Upgrade Plan'
            ) : (
              'Continue to Checkout'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
