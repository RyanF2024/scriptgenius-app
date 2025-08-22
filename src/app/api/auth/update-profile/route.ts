import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const { id, email, full_name, avatar_url } = await request.json();

  if (!id) {
    return new NextResponse('User ID is required', { status: 400 });
  }

  try {
    const supabase = createClient();
    
    // Get the current user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update or create user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id,
        email,
        full_name: full_name || user.user_metadata.full_name || '',
        avatar_url: avatar_url || user.user_metadata.avatar_url || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return new NextResponse('Error updating profile', { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in update-profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
