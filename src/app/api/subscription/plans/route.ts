import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all subscription plans
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }

    // Format the plans for the frontend
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      credits_included: plan.credits_included,
      max_scripts: plan.max_scripts,
      max_team_members: plan.max_team_members,
      features: plan.features || [],
      is_popular: plan.is_popular || false,
    }));

    return NextResponse.json(formattedPlans);
  } catch (error) {
    console.error('Error in subscription plans API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
