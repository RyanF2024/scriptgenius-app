import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SubscriptionService } from '@/lib/services/subscriptionService';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    const history = await SubscriptionService.getBillingHistory(session.user.id, limit);
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching billing history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
