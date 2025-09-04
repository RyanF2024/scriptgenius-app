import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  
  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/account/security?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate with social provider';
      return NextResponse.redirect(
        `${requestUrl.origin}/account/security?error=${encodeURIComponent(errorMessage)}`
      );
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/account/security`);
}
