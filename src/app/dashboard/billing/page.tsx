'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { PaymentMethodManager } from '@/components/billing/PaymentMethodManager';
import { InvoiceHistory } from '@/components/billing/InvoiceHistory';

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('subscription');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle success/error messages from Stripe redirects
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const message = searchParams.get('message');

    if (success === 'true') {
      toast.success('Payment successful! Your subscription has been updated.');
      // Remove query params without refreshing
      router.replace('/dashboard/billing');
    } else if (canceled === 'true') {
      toast.info('Checkout was canceled.');
      router.replace('/dashboard/billing');
    } else if (message) {
      toast.error(decodeURIComponent(message));
      router.replace('/dashboard/billing');
    }
  }, [searchParams, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and billing information
          </p>
        </div>
      </div>

      <Tabs 
        defaultValue="subscription" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionManager />
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <PaymentMethodManager />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
