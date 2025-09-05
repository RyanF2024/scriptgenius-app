import { Database } from './supabase';

export type MfaFactor = Database['public']['Tables']['mfa_factors']['Row'];
export type MfaBackupCode = Database['public']['Tables']['mfa_backup_codes']['Row'];
export type UserSecurityPreferences = Database['public']['Tables']['user_security_preferences']['Row'];

export type MfaMethod = 'totp' | 'webauthn' | 'sms';

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MfaVerifyRequest {
  code: string;
  factorId: string;
}

export interface MfaDisableRequest {
  password: string;
}

export interface MfaBackupCodeVerifyRequest {
  code: string;
}

export interface MfaStatus {
  isMfaEnabled: boolean;
  mfaMethod?: MfaMethod;
  hasBackupCodes: boolean;
  factors: Array<{
    id: string;
    type: MfaMethod;
    displayName?: string;
    lastUsedAt?: string;
  }>;
}

export interface MfaError {
  code: string;
  message: string;
  status?: number;
}
