'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { BillingHistory } from '@/components/billing/BillingHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('subscription');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription, payment methods, and billing history.
        </p>
      </div>

      <Tabs 
        defaultValue="subscription" 
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="subscription">
            <Icons.creditCard className="mr-2 h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="billing">
            <Icons.receipt className="mr-2 h-4 w-4" />
            Billing History
          </TabsTrigger>
          <TabsTrigger value="invoices" disabled>
            <Icons.fileText className="mr-2 h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionManager />
          
          <Card>
            <CardHeader>
              <CardTitle>Need help?</CardTitle>
              <CardDescription>
                Contact our support team for any questions about your subscription or billing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Icons.mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email Us</h4>
                    <p className="text-sm text-muted-foreground">
                      support@scriptgenius.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Icons.messageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Live Chat</h4>
                    <p className="text-sm text-muted-foreground">
                      Available 24/7 for premium users
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <BillingHistory />
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                View and download your past invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Icons.fileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Invoices coming soon</h3>
              <p className="text-muted-foreground mt-2">
                We're working on making your invoices available for download.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
