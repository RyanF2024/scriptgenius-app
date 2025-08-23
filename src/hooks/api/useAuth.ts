import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/services/api/auth/auth.service';
import { SignInCredentials, SignUpData, UpdateProfileData } from '@/services/api/auth/types';

export function useSignIn() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: SignInCredentials) => authService.signIn(credentials),
    onSuccess: (data) => {
      // Update auth state
      queryClient.setQueryData(['user'], data.user);
      // Store token
      localStorage.setItem('access_token', data.accessToken);
      // Redirect
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });
}

export function useSignUp() {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: (userData: SignUpData) => authService.signUp(userData),
    onSuccess: (data) => {
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account',
      });
      router.push('/auth/verify-email');
    },
    onError: (error: any) => {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    },
  });
}

export function useSignOut() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      // Clear auth state
      queryClient.clear();
      // Remove token
      localStorage.removeItem('access_token');
      // Redirect to home
      router.push('/');
    },
    onError: (error: any) => {
      toast({
        title: 'Sign out failed',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: UpdateProfileData }) =>
      authService.updateProfile(userId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => authService.getCurrentUser(),
    // Don't retry on 401 (unauthorized)
    retry: (failureCount, error: any) => 
      error?.status !== 401 && failureCount < 3,
  });
}

export function useRequestPasswordReset() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (email: string) => 
      authService.requestPasswordReset({ email }),
    onSuccess: () => {
      toast({
        title: 'Email sent',
        description: 'Check your email for a password reset link',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send reset email',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });
}

export function useResetPassword() {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authService.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
      });
      router.push('/auth/signin');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to reset password',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });
}
