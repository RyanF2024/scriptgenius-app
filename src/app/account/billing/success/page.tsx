'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function BillingSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID provided');
      setIsLoading(false);
      return;
    }

    const verifySubscription = async () => {
      try {
        const response = await fetch(`/api/subscription/verify?session_id=${sessionId}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to verify subscription');
        }
        
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setError(err.message || 'An error occurred while verifying your subscription');
      } finally {
        setIsLoading(false);
      }
    };

    verifySubscription();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Icons.spinner className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Verifying your subscription...</p>
          <p className="text-muted-foreground mt-2">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="rounded-full bg-red-100 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Icons.xCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-center">Subscription Error</CardTitle>
            <CardDescription className="text-center">
              We encountered an issue processing your subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Please try again or contact support if the problem persists.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              onClick={() => router.push('/pricing')}
              className="w-full"
            >
              Back to Pricing
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/support')}
              className="w-full"
            >
              Contact Support
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Icons.checkCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-center">Subscription Active!</CardTitle>
          <CardDescription className="text-center">
            Thank you for subscribing to {subscription?.plan?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{subscription?.plan?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize font-medium">{subscription?.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing Cycle</span>
              <span className="font-medium">
                {subscription?.plan?.interval === 'year' ? 'Annual' : 'Monthly'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Billing Date</span>
              <span className="font-medium">
                {new Date(subscription?.current_period_end * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/20 rounded-lg">
            <h4 className="font-medium mb-2">What's next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <Icons.checkCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Your account has been upgraded</span>
              </li>
              <li className="flex items-start">
                <Icons.zap className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{subscription?.plan?.credits_included} credits have been added to your account</span>
              </li>
              <li className="flex items-start">
                <Icons.mail className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Check your email for a receipt</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/account/billing')}
            className="w-full"
          >
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
