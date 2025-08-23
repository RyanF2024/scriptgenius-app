import React from 'react';
import { OnboardingLayout } from '../OnboardingLayout';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const CompleteStep: React.FC = () => {
  const { data, completeOnboarding, isSubmitting } = useOnboarding();
  const router = useRouter();

  const handleGetStarted = async () => {
    await completeOnboarding();
    // Redirect to dashboard or home after completion
    router.push('/dashboard');
  };

  return (
    <OnboardingLayout hideBackButton nextButtonText="Get Started" onNext={handleGetStarted} isLoading={isSubmitting}>
      <div className="text-center py-8">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">You're all set, {data.displayName || 'Writer'}!</h2>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Your ScriptGenius account is ready to go. Let's start improving your screenwriting journey.
        </p>
        
        <div className="bg-muted/50 p-6 rounded-lg text-left max-w-md mx-auto mb-8 space-y-4">
          <h3 className="font-medium">What's next?</h3>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 text-primary flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium">Upload your first script</h4>
              <p className="text-sm text-muted-foreground">Get instant feedback on your writing.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 text-primary flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium">Explore your dashboard</h4>
              <p className="text-sm text-muted-foreground">Track your progress and insights.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 text-primary flex items-center justify-center mr-3 mt-0.5">
              <span className="text-xs font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium">Join the community</h4>
              <p className="text-sm text-muted-foreground">Connect with other writers and share your work.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Need help getting started? Check out our <a href="/help" className="text-primary hover:underline">help center</a>.
          </p>
          
          <Button 
            onClick={handleGetStarted}
            disabled={isSubmitting}
            size="lg"
            className="min-w-[200px]"
          >
            {isSubmitting ? 'Setting up your account...' : 'Start Writing'}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
