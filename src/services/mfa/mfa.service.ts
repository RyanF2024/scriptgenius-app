import { supabase } from '@/lib/supabase/client';
import type { MfaBackupCodeVerifyRequest } from '@/types/mfa';
import * as OTPAuth from 'otpauth';
import { randomBytes } from 'crypto';
import { Buffer } from 'buffer';
import { compareSync } from 'bcryptjs';
import { encrypt, decrypt, ensureDecrypted } from '@/lib/security/encryption';

interface BackupCode {
  id: string;
  code_hash: string;
  is_used: boolean;
  user_id: string;
  created_at: string;
  used_at: string | null;
}

// Rate limiting configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// Configuration
const MFA_CONFIG = {
  backupCodes: {
    count: 8, // Number of backup codes to generate
    length: 10, // Length of each backup code
  },
  totp: {
    issuer: 'ScriptGenius',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  },
};
import { AuthError } from '@supabase/supabase-js';

const TOTP_ISSUER = 'ScriptGenius';
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30;
const TOTP_ALGORITHM = 'SHA1';

export const mfaService = {
  // Generate a new TOTP secret and QR code URL
  async setup2FA(userId: string, email: string): Promise<MfaSetupResponse> {
    try {
      // Generate a new TOTP secret
      const secret = new OTPAuth.Secret({
        size: 20,
        buffer: randomBytes(20)
      }).base32;

      // Create TOTP instance
      const totp = new OTPAuth.TOTP({
        issuer: TOTP_ISSUER,
        label: email,
        algorithm: TOTP_ALGORITHM,
        digits: TOTP_DIGITS,
        period: TOTP_PERIOD,
        secret: OTPAuth.Secret.fromBase32(secret)
      });

      // Generate QR code URL
      const qrCodeUrl = totp.toString();

      // Generate backup codes using configured count
      const { data: backupCodes, error: codesError } = await supabase.rpc('generate_backup_codes', {
        user_uuid: userId,
        code_count: MFA_CONFIG.backupCodes.count
      });

      if (codesError) {
        console.error('Error generating backup codes:', codesError);
        throw new Error('Failed to generate backup codes');
      }

      // Encrypt the secret before storing
      const encryptedSecret = encrypt(secret);

      // Store the encrypted secret temporarily until verified
      const { error: sessionError } = await supabase
        .from('mfa_temp_secrets')
        .upsert({
          user_id: userId,
          secret: encryptedSecret,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes expiry
        }, { onConflict: 'user_id' });

      if (sessionError) {
        console.error('Error storing temporary secret:', sessionError);
        throw new Error('Failed to initialize 2FA setup');
      }

      return {
        secret,
        qrCodeUrl,
        backupCodes: backupCodes || []
      };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw new Error('Failed to set up 2FA');
    }
  },

  // Verify a TOTP code
  async verify2FACode(userId: string, request: MfaVerifyRequest): Promise<{ success: boolean }> {
    try {
      // Get the temporary secret for this user
      const { data: tempSecret, error: fetchError } = await supabase
        .from('mfa_temp_secrets')
        .select('secret')
        .eq('user_id', userId)
        .single();

      if (fetchError || !tempSecret) {
        throw new Error('2FA setup session expired or not found. Please start the setup process again.');
      }
      
      // Decrypt the secret if it's encrypted
      const secret = ensureDecrypted(tempSecret.secret);

      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: TOTP_ISSUER,
        algorithm: TOTP_ALGORITHM,
        digits: TOTP_DIGITS,
        period: TOTP_PERIOD,
        secret: OTPAuth.Secret.fromBase32(secret)
      });

      const isValid = totp.validate({ token: request.code, window: 1 }) !== null;

      if (!isValid) {
        return { success: false };
      }

      // Encrypt the secret before storing
      const encryptedSecret = encrypt(secret);
      
      // Store the encrypted secret in the user's security preferences
      const { error: updateError } = await supabase
        .from('user_security_preferences')
        .upsert({
          user_id: userId,
          mfa_enabled: true,
          mfa_secret: encryptedSecret,
          mfa_method: 'totp',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (updateError) {
        throw new Error('Failed to enable 2FA. Please try again.');
      }

      // Clean up the temporary secret
      await supabase
        .from('mfa_temp_secrets')
        .delete()
        .eq('user_id', userId);

      return { success: true };
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      throw error;
    }
  },

  // Verify a TOTP code for a specific factor
  async verify2FACodeForFactor(userId: string, request: MfaVerifyRequest): Promise<{ success: boolean }> {
    try {
      const { data: factor, error: factorError } = await supabase
        .from('mfa_factors')
        .select('*')
        .eq('id', request.factorId)
        .eq('user_id', userId)
        .single();

      if (factorError || !factor) {
        throw new Error('Invalid 2FA factor');
      }

      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(factor.secret!)
      });

      const isValid = totp.validate({ token: request.code, window: 1 }) !== null;

      if (isValid) {
        // Mark factor as verified if it wasn't already
        if (!factor.is_verified) {
          await supabase
            .from('mfa_factors')
            .update({ is_verified: true, last_used_at: new Date().toISOString() })
            .eq('id', request.factorId);
        } else {
          await supabase
            .from('mfa_factors')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', request.factorId);
        }

        // Enable MFA for the user
        await supabase
          .from('user_security_preferences')
          .upsert({
            user_id: userId,
            mfa_enabled: true,
            mfa_method: 'totp',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      }

      return { success: isValid };
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      throw new Error('Failed to verify 2FA code');
    }
  },

  // Track failed attempts in memory (in production, consider using Redis)
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Check if the user is currently locked out
function isUserLockedOut(userId: string): { locked: boolean; remainingTime?: number } {
  const userAttempts = failedAttempts.get(userId);
  if (!userAttempts) return { locked: false };

  const lockoutDurationMs = LOCKOUT_DURATION_MINUTES * 60 * 1000;
  const timeSinceLastAttempt = Date.now() - userAttempts.lastAttempt;
  
  if (userAttempts.count >= MAX_FAILED_ATTEMPTS && timeSinceLastAttempt < lockoutDurationMs) {
    const remainingTime = Math.ceil((lockoutDurationMs - timeSinceLastAttempt) / 60000); // in minutes
    return { locked: true, remainingTime };
  }
  
  // Reset counter if the lockout period has passed
  if (timeSinceLastAttempt >= lockoutDurationMs) {
    failedAttempts.delete(userId);
    return { locked: false };
  }
  
  return { locked: false };
}

// Track a failed attempt
function trackFailedAttempt(userId: string): { locked: boolean; remainingAttempts: number; remainingTime?: number } {
  const userAttempts = failedAttempts.get(userId) || { count: 0, lastAttempt: 0 };
  const now = Date.now();
  
  // Reset counter if last attempt was before the lockout period
  if (now - userAttempts.lastAttempt >= LOCKOUT_DURATION_MINUTES * 60 * 1000) {
    userAttempts.count = 0;
  }
  
  userAttempts.count++;
  userAttempts.lastAttempt = now;
  failedAttempts.set(userId, userAttempts);
  
  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - userAttempts.count);
  
  return {
    locked: userAttempts.count >= MAX_FAILED_ATTEMPTS,
    remainingAttempts,
    remainingTime: LOCKOUT_DURATION_MINUTES
  };
}

// Disable 2FA for a user
async disable2FA(userId: string, request: MfaDisableRequest): Promise<{ success: boolean }> {
  try {
    // Check if user is locked out
    const lockoutStatus = isUserLockedOut(userId);
    if (lockoutStatus.locked) {
      throw new Error(`Too many failed attempts. Please try again in ${lockoutStatus.remainingTime} minutes.`);
    }

    // Verify the user's password first
    const { error: authError } = await supabase.rpc('verify_user_password', {
      user_uuid: userId,
      password: request.password
    });

    if (authError) {
      // Track failed attempt
      const { locked, remainingAttempts } = trackFailedAttempt(userId);
      
      if (locked) {
        throw new Error(`Too many failed attempts. Your account has been locked for ${LOCKOUT_DURATION_MINUTES} minutes.`);
      }
      
      throw new Error(`Incorrect password. ${remainingAttempts} attempt(s) remaining.`);
    }
    
    // Reset failed attempts on successful password verification
    failedAttempts.delete(userId);

      // Disable MFA in the user's security preferences
      const { error: updateError } = await supabase
        .from('user_security_preferences')
        .update({
          mfa_enabled: false,
          mfa_secret: null,
          mfa_method: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error('Failed to disable 2FA. Please try again.');
      }

      // Delete all MFA factors and backup codes
      const { error: deleteError } = await supabase.rpc('delete_user_mfa_data', {
        user_uuid: userId
      });

      if (deleteError) {
        console.error('Error cleaning up MFA data:', deleteError);
        // Continue even if cleanup fails, as the main operation succeeded
      }

      return { success: true };
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  },

  /**
   * Verifies a backup code using secure comparison
   * @param userId The user's ID
   * @param request The backup code verification request
   * @returns Object indicating if verification was successful
   */
  async verifyBackupCode(userId: string, request: MfaBackupCodeVerifyRequest): Promise<{ success: boolean }> {
    try {
      // Fetch all unused backup codes for the user
      const { data: codes, error } = await supabase
        .from<BackupCode>('mfa_backup_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_used', false);

      if (error) {
        console.error('Error fetching backup codes:', error);
        throw new Error('Failed to verify backup code');
      }

      if (!codes || codes.length === 0) {
        return { success: false };
      }

      // Find a matching code using crypt() for secure comparison
      for (const code of codes) {
        // Use the stored hash as the salt in the crypt() function
        // This will properly verify the code against the stored hash
        if (code.code_hash === crypt(request.code, code.code_hash)) {
          // Mark the code as used
          const { error: updateError } = await supabase
            .from('mfa_backup_codes')
            .update({ 
              is_used: true,
              used_at: new Date().toISOString() 
            })
            .eq('id', code.id);
          
          if (updateError) {
            console.error('Error marking backup code as used:', updateError);
            throw new Error('Failed to update backup code status');
          }
          
          return { success: true };
        }
      }

      return { success: false };
    } catch (error) {
      console.error('Error in verifyBackupCode:', error);
      throw new Error('Failed to verify backup code');
    }
  },

  // Get MFA status for the current user
  async getMFAStatus(userId: string): Promise<MfaStatus> {
    try {
      // Execute all database queries in parallel
      const [
        { data: preferences, error: prefError },
        { data: factors, error: factorsError },
        { count: backupCodesCount, error: codesError }
      ] = await Promise.all([
        // Get user's MFA preferences
        supabase
          .from('user_security_preferences')
          .select('mfa_enabled, mfa_method')
          .eq('user_id', userId)
          .single(),
        
        // Get MFA factors
        supabase
          .from('mfa_factors')
          .select('id, type, display_name, last_used_at')
          .eq('user_id', userId),
        
        // Check if backup codes exist
        supabase
          .from('mfa_backup_codes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_used', false)
      ]);

      // Handle any errors from the parallel queries
      if (prefError && prefError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw prefError;
      }
      if (factorsError) {
        throw factorsError;
      }
      if (codesError) {
        throw codesError;
      }

      const isMfaEnabled = preferences?.mfa_enabled || false;
      const mfaMethod = preferences?.mfa_method as MfaMethod | undefined;

      return {
        isMfaEnabled,
        mfaMethod,
        hasBackupCodes: (backupCodesCount || 0) > 0,
        factors: (factors || []).map(factor => ({
          id: factor.id,
          type: factor.type,
          displayName: factor.display_name || undefined,
          lastUsedAt: factor.last_used_at || undefined
        }))
      };
    } catch (error) {
      console.error('Error getting MFA status:', error);
      throw new Error('Failed to retrieve MFA status');
    }
  },

  // Generate new backup codes
  async generateNewBackupCodes(userId: string): Promise<string[]> {
    const { data: backupCodes, error } = await supabase.rpc('generate_backup_codes', {
      user_uuid: userId,
      code_count: MFA_CONFIG.backupCodes.count
    });

    if (error) {
      console.error('Error generating backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }

    return backupCodes || [];
  }
};
