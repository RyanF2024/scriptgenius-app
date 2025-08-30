import { supabase } from '@/lib/supabase/client';
import { MfaSetupResponse, MfaVerifyRequest, MfaDisableRequest, MfaBackupCodeVerifyRequest, MfaStatus, MfaError, MfaMethod } from '@/types/mfa';
import * as OTPAuth from 'otpauth';
import { randomBytes } from 'crypto';
import { Buffer } from 'buffer';
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

      // Generate backup codes
      const { data: backupCodes, error: codesError } = await supabase.rpc('generate_backup_codes', {
        user_uuid: userId,
        code_count: 8
      });

      if (codesError) {
        console.error('Error generating backup codes:', codesError);
        throw new Error('Failed to generate backup codes');
      }

      // Store the secret in a temporary session for verification
      const { error: sessionError } = await supabase
        .from('mfa_temp_secrets')
        .upsert({
          user_id: userId,
          secret,
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

      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: TOTP_ISSUER,
        algorithm: TOTP_ALGORITHM,
        digits: TOTP_DIGITS,
        period: TOTP_PERIOD,
        secret: OTPAuth.Secret.fromBase32(tempSecret.secret)
      });

      const isValid = totp.validate({ token: request.code, window: 1 }) !== null;

      if (!isValid) {
        return { success: false };
      }

      // Store the verified secret in the user's profile
      const { error: updateError } = await supabase
        .from('user_security_preferences')
        .upsert({
          user_id: userId,
          mfa_enabled: true,
          mfa_secret: tempSecret.secret,
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
            is_mfa_enabled: true,
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

  // Disable 2FA for a user
  async disable2FA(userId: string, request: MfaDisableRequest): Promise<{ success: boolean }> {
    try {
      // Verify the user's password first
      const { error: authError } = await supabase.rpc('verify_user_password', {
        user_uuid: userId,
        password: request.password
      });

      if (authError) {
        if ((authError as any).code === '400') {
          throw new Error('Incorrect password. Please try again.');
        }
        throw authError;
      }

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

  // Verify a backup code
  async verifyBackupCode(userId: string, request: MfaBackupCodeVerifyRequest): Promise<{ success: boolean }> {
    const { data: codes, error } = await supabase
      .from('mfa_backup_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_used', false);

    if (error) {
      console.error('Error fetching backup codes:', error);
      throw new Error('Failed to verify backup code');
    }

    const code = codes?.find(c => 
      c.code_hash === Buffer.from(request.code).toString('base64')
    );

    if (!code) {
      return { success: false };
    }

    // Mark the code as used
    await supabase
      .from('mfa_backup_codes')
      .update({ 
        is_used: true,
        used_at: new Date().toISOString() 
      })
      .eq('id', code.id);

    return { success: true };
  },

  // Get MFA status for the current user
  async getMFAStatus(userId: string): Promise<MfaStatus> {
    try {
      // Get user's MFA preferences
      const { data: preferences, error: prefError } = await supabase
        .from('user_security_preferences')
        .select('mfa_enabled, mfa_method')
        .eq('user_id', userId)
        .single();

      if (prefError && prefError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw prefError;
      }

      const isMfaEnabled = preferences?.mfa_enabled || false;
      const mfaMethod = preferences?.mfa_method as MfaMethod | undefined;

      // Get MFA factors
      const { data: factors, error: factorsError } = await supabase
        .from('mfa_factors')
        .select('id, type, display_name, last_used_at')
        .eq('user_id', userId);

      if (factorsError) {
        throw factorsError;
      }

      // Check if backup codes exist
      const { count: backupCodesCount, error: codesError } = await supabase
        .from('mfa_backup_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_used', false);

      if (codesError) {
        throw codesError;
      }

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
      code_count: 8
    });

    if (error) {
      console.error('Error generating backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }

    return backupCodes || [];
  }
};
