import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json({ data: data?.onboarding_data || null });
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch onboarding data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: onboardingData } = await request.json();

    const { data, error } = await supabase
      .from('user_onboarding')
      .upsert(
        {
          user_id: session.user.id,
          onboarding_data: onboardingData,
          updated_at: new Date().toISOString(),
          ...(onboardingData.currentStep === 'complete' && { completed_at: new Date().toISOString() })
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to save onboarding data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { error } = await supabase
      .from('user_onboarding')
      .delete()
      .eq('user_id', session.user.id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting onboarding data:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete onboarding data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
