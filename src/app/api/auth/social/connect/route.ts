import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const provider = requestUrl.searchParams.get('provider') as 'google' | 'github' | 'microsoft';
  
  if (!provider) {
    return NextResponse.redirect(
      `${requestUrl.origin}/account/security?error=invalid_provider`,
      { status: 400 }
    );
  }

  const supabase = createRouteHandlerClient({ cookies });
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${requestUrl.origin}/api/auth/social/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error connecting social account:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/account/security?error=connection_failed`,
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.url);
}
