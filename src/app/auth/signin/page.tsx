'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/icons';

type OAuthProvider = 'google' | 'github';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<boolean | string>(false);
  const router = useRouter();
  const { toast } = useToast();
  const { signIn, signInWithOAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading('email');
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message || 'An error occurred during sign in',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Success',
        description: 'You have been signed in successfully',
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    setIsLoading(provider);
    
    try {
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        toast({
          title: `${provider} sign in failed`,
          description: error.message || 'An error occurred during sign in',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Enter your email to sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => router.push('/auth/forgot-password')}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!!isLoading}
          >
            {isLoading === 'email' ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In with Email'
            )}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            type="button" 
            disabled={!!isLoading}
            onClick={() => handleOAuthSignIn('github')}
          >
            {isLoading === 'github' ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.gitHub className="mr-2 h-4 w-4" />
            )}
            GitHub
          </Button>
          <Button 
            variant="outline" 
            type="button" 
            disabled={!!isLoading}
            onClick={() => handleOAuthSignIn('google')}
          >
            {isLoading === 'google' ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Google
          </Button>
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => router.push('/auth/signup')}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
