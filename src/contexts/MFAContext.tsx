'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { mfaService } from '@/services/mfa/mfa.service';
import type { MfaStatus, MfaError, MfaMethod } from '@/types/mfa';
import { useToast } from '@/components/ui/use-toast';

type MFAContextType = {
  // State
  mfaStatus: MfaStatus | null;
  isLoading: boolean;
  error: MfaError | null;
  isSetupInProgress: boolean;
  backupCodes: string[];
  
  // Actions
  start2FASetup: () => Promise<{ secret: string; qrCodeUrl: string }>;
  verify2FASetup: (code: string) => Promise<boolean>;
  confirm2FASetup: (backupCodes: string[]) => void;
  disable2FA: (password: string) => Promise<boolean>;
  verifyBackupCode: (code: string) => Promise<boolean>;
  generateNewBackupCodes: () => Promise<string[]>;
  refreshMFAStatus: () => Promise<void>;
  clearError: () => void;
  
  // Status helpers
  is2FAEnabled: boolean;
  hasBackupCodes: boolean;
  getPreferred2FAMethod: () => MfaMethod | undefined;
};

const MFAContext = createContext<MFAContextType | undefined>(undefined);

export function MFAProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [mfaStatus, setMfaStatus] = useState<MfaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<MfaError | null>(null);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  // Computed properties
  const is2FAEnabled = mfaStatus?.isMfaEnabled || false;
  const hasBackupCodes = mfaStatus?.hasBackupCodes || false;

  const fetchMFAStatus = useCallback(async () => {
    if (!user) {
      setMfaStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const status = await mfaService.getMFAStatus(user.id);
      setMfaStatus(status);
      return status;
    } catch (err) {
      console.error('Error fetching MFA status:', err);
      const error: MfaError = {
        code: 'fetch_failed',
        message: err instanceof Error ? err.message : 'Failed to fetch MFA status',
        status: 500
      };
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch of MFA status
  useEffect(() => {
    fetchMFAStatus().catch(console.error);
  }, [fetchMFAStatus]);
  
  // Auto-refresh MFA status when auth state changes
  useEffect(() => {
    if (user) {
      fetchMFAStatus().catch(console.error);
    } else {
      setMfaStatus(null);
      setBackupCodes([]);
      setIsSetupInProgress(false);
    }
  }, [user, fetchMFAStatus]);

  const start2FASetup = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsSetupInProgress(true);
      
      // Clear any existing setup data
      setBackupCodes([]);
      
      // Start the 2FA setup process
      const result = await mfaService.setup2FA(user.id, user.email || '');
      
      // Store backup codes temporarily
      setBackupCodes(result.backupCodes);
      
      return {
        secret: result.secret,
        qrCodeUrl: result.qrCodeUrl
      };
    } catch (err) {
      console.error('Error starting 2FA setup:', err);
      const error: MfaError = {
        code: 'setup_failed',
        message: err instanceof Error ? err.message : 'Failed to start 2FA setup',
        status: 500
      };
      setError(error);
      setIsSetupInProgress(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const verify2FASetup = useCallback(async (code: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Verify the 2FA code
      const result = await mfaService.verify2FACode(user.id, { code, factorId: 'totp' });
      
      if (!result.success) {
        throw new Error('Invalid verification code');
      }
      
      // Refresh the MFA status
      await fetchMFAStatus();
      
      return true;
    } catch (err) {
      console.error('Error verifying 2FA setup:', err);
      const error: MfaError = {
        code: 'verification_failed',
        message: err instanceof Error ? err.message : 'Invalid verification code',
        status: 400
      };
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchMFAStatus]);
  
  const confirm2FASetup = useCallback(async () => {
    try {
      setIsLoading(true);
      // First, refresh the MFA status to get the latest backup codes
      await fetchMFAStatus();
      
      // Show success message
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been successfully set up.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error confirming 2FA setup:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete 2FA setup. Please try again.',
        type: 'error',
      });
      throw error;
    } finally {
      setIsSetupInProgress(false);
      setIsLoading(false);
    }
  }, [fetchMFAStatus, toast]);

  const disable2FA = useCallback(async (password: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);
      const { success } = await mfaService.disable2FA(user.id, { password });
      if (success) {
        await fetchMFAStatus();
      }
      return success;
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      const error: MfaError = {
        code: 'disable_failed',
        message: err instanceof Error ? err.message : 'Failed to disable 2FA',
        status: 500
      };
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchMFAStatus]);

  const verifyBackupCode = useCallback(async (code: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Verify the backup code
      const result = await mfaService.verifyBackupCode(user.id, { code });
      
      if (!result.success) {
        throw new Error('Invalid backup code');
      }
      
      return true;
    } catch (err) {
      console.error('Error verifying backup code:', err);
      const error: MfaError = {
        code: 'backup_code_failed',
        message: err instanceof Error ? err.message : 'Invalid backup code',
        status: 400
      };
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const generateNewBackupCodes = useCallback(async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Generate new backup codes
      const codes = await mfaService.generateNewBackupCodes(user.id);
      
      // Update the local state with the new codes
      setBackupCodes(codes);
      
      // Refresh the MFA status to update the backup codes status
      await fetchMFAStatus();
      
      // Show success message
      toast({
        title: 'Backup Codes Generated',
        description: 'New backup codes have been generated. Please save them in a safe place.',
        type: 'success',
      });
      
      return codes;
    } catch (err) {
      console.error('Error generating backup codes:', err);
      const error: MfaError = {
        code: 'backup_codes_failed',
        message: err instanceof Error ? err.message : 'Failed to generate backup codes',
        status: 500
      };
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchMFAStatus, toast]);

  const getPreferred2FAMethod = useCallback((): MfaMethod | undefined => {
    if (!mfaStatus) return undefined;
    return mfaStatus.mfaMethod;
  }, [mfaStatus]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    mfaStatus,
    isLoading,
    error,
    isSetupInProgress,
    backupCodes,
    
    // Actions
    start2FASetup,
    verify2FASetup,
    confirm2FASetup,
    disable2FA,
    verifyBackupCode,
    generateNewBackupCodes,
    refreshMFAStatus: fetchMFAStatus,
    clearError,
    
    // Status helpers
    is2FAEnabled,
    hasBackupCodes,
    getPreferred2FAMethod,
  };

  return <MFAContext.Provider value={value}>{children}</MFAContext.Provider>;
}

export function useMFA() {
  const context = useContext(MFAContext);
  if (context === undefined) {
    throw new Error('useMFA must be used within an MFAProvider');
  }
  return context;
}

export function MFAConsumer({ children }: { children: (value: MFAContextType) => ReactNode }) {
  return (
    <MFAContext.Consumer>
      {context => {
        if (context === undefined) {
          throw new Error('MFAConsumer must be used within an MFAProvider');
        }
        return children(context);
      }}
    </MFAContext.Consumer>
  );
}
