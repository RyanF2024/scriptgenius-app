'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export function PaymentMethodManager() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/billing/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setIsSettingDefault(paymentMethodId);
      const response = await fetch(`/api/billing/payment-methods/${paymentMethodId}/default`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to update default payment method');
      
      await fetchPaymentMethods();
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    
    try {
      setIsRemoving(paymentMethodId);
      const response = await fetch(`/api/billing/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove payment method');
      
      await fetchPaymentMethods();
      toast.success('Payment method removed');
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast.error('Failed to remove payment method');
    } finally {
      setIsRemoving(null);
    }
  };

  const handleSetupPaymentMethod = async () => {
    try {
      setIsSettingUp(true);
      const response = await fetch('/api/billing/setup-intent', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to set up payment method');
      
      const { clientSecret } = await response.json();
      
      // This would be replaced with Stripe Elements or Checkout
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret);
      
      if (error) throw error;
      
      await fetchPaymentMethods();
      toast.success('Payment method added successfully');
    } catch (error) {
      console.error('Error setting up payment method:', error);
      toast.error('Failed to add payment method');
    } finally {
      setIsSettingUp(false);
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <Icons.creditCard className="h-5 w-5 text-[#1A1F71]" />;
      case 'mastercard':
        return <Icons.creditCard className="h-5 w-5 text-[#EB001B]" />;
      case 'amex':
        return <Icons.creditCard className="h-5 w-5 text-[#006FCF]" />;
      case 'discover':
        return <Icons.creditCard className="h-5 w-5 text-[#FF6600]" />;
      default:
        return <Icons.creditCard className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </div>
          <Button 
            onClick={handleSetupPaymentMethod}
            disabled={isSettingUp}
          >
            {isSettingUp ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <Icons.creditCard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No payment methods</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Add a payment method to get started
            </p>
            <Button onClick={handleSetupPaymentMethod} disabled={isSettingUp}>
              {isSettingUp ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Payment Method'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-md bg-muted p-2">
                    {getCardIcon(method.brand)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                      </span>
                      {method.is_default && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year.toString().slice(-2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      disabled={isSettingDefault === method.id}
                    >
                      {isSettingDefault === method.id ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        'Set as Default'
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    disabled={isRemoving === method.id || (method.is_default && paymentMethods.length > 1)}
                    title={method.is_default && paymentMethods.length > 1 ? "Set another payment method as default first" : "Remove payment method"}
                  >
                    {isRemoving === method.id ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.trash className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
