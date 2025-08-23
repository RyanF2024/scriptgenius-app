'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useRequireAuth(redirectUrl = '/auth/signin') {
  const { user, isLoading: authLoading } = useAuthContext();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !profileLoading && !user) {
      toast({
        title: 'Authentication required',
        description: 'You need to be signed in to access this page.',
        variant: 'destructive',
      });
      router.push(redirectUrl);
    }
  }, [user, authLoading, profileLoading, router, redirectUrl]);

  return { 
    user, 
    profile, 
    isLoading: authLoading || profileLoading,
    isAuthenticated: !!user,
  };
}

export function useRequireProfile(redirectUrl = '/onboarding') {
  const { user, isLoading: authLoading } = useAuthContext();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !profileLoading && user && !profile) {
      toast({
        title: 'Profile setup required',
        description: 'Please complete your profile to continue.',
        variant: 'default',
      });
      router.push(redirectUrl);
    }
  }, [user, profile, authLoading, profileLoading, router, redirectUrl]);

  return { 
    user, 
    profile, 
    isLoading: authLoading || profileLoading,
    isProfileComplete: !!profile,
  };
}

export function useRedirectIfAuthenticated(redirectUrl = '/dashboard') {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectUrl);
    }
  }, [user, isLoading, router, redirectUrl]);

  return { isLoading };
}
