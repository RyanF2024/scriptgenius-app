'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socialService } from '@/services/social/social.service';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

type SocialAccount = {
  provider: string;
  identity_data: {
    email?: string;
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
};

type SocialContextType = {
  accounts: SocialAccount[];
  isLoading: boolean;
  error: string | null;
  connectAccount: (provider: 'google' | 'github' | 'microsoft') => Promise<void>;
  disconnectAccount: (provider: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
};

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const connectedAccounts = await socialService.getConnectedAccounts();
      setAccounts(connectedAccounts);
    } catch (err) {
      console.error('Error fetching social accounts:', err);
      setError('Failed to load connected accounts');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const connectAccount = async (provider: 'google' | 'github' | 'microsoft') => {
    try {
      setIsLoading(true);
      setError(null);
      await socialService.connectSocialAccount(provider);
      // The page will refresh after OAuth flow, so no need to update state here
    } catch (err) {
      console.error('Error connecting social account:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectAccount = async (provider: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await socialService.disconnectSocialAccount(provider);
      await fetchAccounts();
      toast({
        title: 'Success',
        description: 'Social account disconnected successfully',
        type: 'success',
      });
    } catch (err) {
      console.error('Error disconnecting social account:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect account';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SocialContext.Provider
      value={{
        accounts,
        isLoading,
        error,
        connectAccount,
        disconnectAccount,
        refreshAccounts: fetchAccounts,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}
