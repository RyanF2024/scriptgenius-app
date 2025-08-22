import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SubscriptionService } from '@/lib/services/subscriptionService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const [subscription, credits] = await Promise.all([
      SubscriptionService.getCurrentSubscription(session.user.id),
      SubscriptionService.getCreditBalance(session.user.id),
    ]);

    return NextResponse.json({
      subscription,
      credits,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handle subscription updates (e.g., cancel, change plan)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { action, planId, billingInterval } = await req.json();

    switch (action) {
      case 'change_plan':
        if (!planId || !billingInterval) {
          return new NextResponse('Missing required parameters', { status: 400 });
        }
        const { url } = await SubscriptionService.createCheckoutSession(
          session.user.id,
          planId,
          billingInterval
        );
        return NextResponse.json({ url });

      case 'cancel':
        const subscription = await SubscriptionService.getCurrentSubscription(session.user.id);
        if (!subscription?.stripe_subscription_id) {
          return new NextResponse('No active subscription found', { status: 400 });
        }
        
        // In a real app, you would call the Stripe API to cancel the subscription
        // For now, we'll just update the status in the database
        await SubscriptionService.cancelSubscription(session.user.id);
        return NextResponse.json({ success: true });

      default:
        return new NextResponse('Invalid action', { status: 400 });
    }
  } catch (error) {
    console.error('Subscription action failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
