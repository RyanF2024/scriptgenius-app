import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

export const metadata: Metadata = {
  title: 'Onboarding - ScriptGenius',
  description: 'Complete your profile to get started with ScriptGenius',
};

export default async function OnboardingPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login?redirect=/onboarding');
  }

  // Check if onboarding is already completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', session.user.id)
    .single();

  // Redirect to dashboard if onboarding is already completed
  if (profile?.onboarding_complete) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <OnboardingFlow />
        </div>
      </main>
    </div>
  );
}
