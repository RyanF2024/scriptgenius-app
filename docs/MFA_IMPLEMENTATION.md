# Multi-Factor Authentication (MFA) Implementation

This document details the TOTP-based Multi-Factor Authentication implementation in ScriptGenius, including backup code management and security considerations.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [TOTP Implementation](#totp-implementation)
- [Backup Code Management](#backup-code-management)
- [Security Considerations](#security-considerations)
- [Recovery Flows](#recovery-flows)
- [Rate Limiting](#rate-limiting)
- [Audit Logging](#audit-logging)

## Architecture Overview

### System Components

#### 1. Frontend Components
- **MFA Setup Wizard**
  - QR code generation and display
  - Manual entry code display
  - Verification code input
  - Backup code display and download

#### 2. Backend Services
- **MFA Service**
  - TOTP secret generation
  - Code verification
  - Session management
  - Rate limiting

#### 3. Database Schema
- `mfa_factors` - Stores active MFA factors
- `mfa_backup_codes` - Hashed backup codes
- `audit_log` - Security event logging

## TOTP Implementation

### 1. TOTP Configuration
```typescript
const TOTP_CONFIG = {
  issuer: 'ScriptGenius',
  algorithm: 'SHA1',
  digits: 6,
  period: 30, // seconds
  window: 1,  // number of time steps to check before/after
};
```

### 2. MFA Context
- **Location**: `src/contexts/MFAContext.tsx`
- **Purpose**: Manages MFA state and provides methods for MFA operations
- **Key Methods**:
  - `start2FASetup()`: Initiates MFA setup
  - `verify2FASetup(code)`: Verifies MFA setup with a TOTP code
  - `disable2FA(password)`: Disables MFA (requires password verification)
  - `generateNewBackupCodes()`: Generates new backup codes (replaces existing ones)
  - `verifyBackupCode(code)`: Verifies a backup code

### 3. MFA Service

#### TOTP Operations
```typescript
// Generate a new TOTP secret
async function generateTOTPSecret(userId: string) {
  const secret = speakeasy.generateSecret({
    length: 32,
    name: `ScriptGenius:${userId}`,
    issuer: TOTP_CONFIG.issuer,
  });
  
  // Store the secret in the database
  await storeMFASecret(userId, secret.base32);
  
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
}

// Verify TOTP code
async function verifyTOTPCode(userId: string, code: string) {
  const secret = await getMFASecret(userId);
  
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: TOTP_CONFIG.window,
  });
}
```
- **Location**: `src/services/mfa/mfa.service.ts`
- **Purpose**: Handles MFA business logic and API calls
- **Key Functions**:
  - `setup2FA()`: Sets up MFA for a user
  - `verify2FACodeForFactor()`: Verifies MFA codes for a specific factor
  - `disable2FA()`: Disables MFA with password verification
  - `generateBackupCodes()`: Generates secure backup codes (12-char format: XXXX-XXXX-XXXX)
  - `verifyBackupCode()`: Verifies backup codes using bcrypt hashing

## Backup Code Management

### 1. Code Generation
- 12-character alphanumeric codes
- Hyphen-separated for readability (XXXX-XXXX-XXXX)
- One-time use
- Automatically expires after first use or 90 days

### 2. Storage
```sql
CREATE TABLE mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);
```

### 3. Code Verification Flow
1. User enters backup code
2. System looks up unused, unexpired code
3. On successful verification:
   - Marks code as used
   - Records usage timestamp
   - Generates audit log entry
   - Issues new session token

## Security Considerations

### 1. Rate Limiting
- 5 attempts per 15 minutes for MFA verification
- 3 failed attempts trigger account lockout
- 30-minute lockout period
- Email notification on lockout

### 2. Session Management
- MFA verification required for sensitive operations
- Session invalidation on:
  - Password change
  - MFA disable
  - Suspicious activity

### 3. Audit Logging
All MFA-related events are logged with:
- Timestamp
- User ID
- IP address
- User agent
- Action type
- Success/failure status

### 3. Database Tables

#### `mfa_factors`
```sql
CREATE TABLE mfa_factors (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  factor_type TEXT NOT NULL,
  secret TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `mfa_backup_codes`
```sql
CREATE TABLE mfa_backup_codes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Considerations

1. **Secret Storage**:
   - MFA secrets are encrypted at rest
   - Temporary secrets expire after 30 minutes
   - Backup codes are hashed before storage

2. **Rate Limiting**:
   - 5 attempts per 15 minutes for MFA verification
   - 3 failed attempts trigger account lockout

3. **Session Management**:
   - MFA verification is required for sensitive operations
   - Sessions are invalidated on password change

## Testing

### Unit Tests
- MFA service methods
- Context hooks
- Validation logic

### Integration Tests
- Complete MFA flow
- Error scenarios
- Session management

## Troubleshooting

### Common Issues
1. **Invalid Code**
   - Check device time synchronization
   - Verify code entry
   - Try a new code

2. **Setup Failures**
   - Ensure user has valid session
   - Check database connection
   - Verify MFA service status

For more details, see the [API Documentation](./API.md#mfa).
