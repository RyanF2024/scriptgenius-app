# Multi-Factor Authentication (MFA) Implementation

## Key Components

### 1. MFA Context
- **Location**: `src/contexts/MFAContext.tsx`
- **Purpose**: Manages MFA state and provides methods for MFA operations
- **Key Methods**:
  - `start2FASetup()`: Initiates MFA setup
  - `verify2FASetup(code)`: Verifies MFA setup
  - `disable2FA(password)`: Disables MFA
  - `generateNewBackupCodes()`: Generates new backup codes

### 2. MFA Service
- **Location**: `src/services/mfa/mfa.service.ts`
- **Purpose**: Handles MFA business logic and API calls
- **Key Functions**:
  - `setup2FA()`: Sets up MFA for a user
  - `verify2FACode()`: Verifies MFA codes
  - `disable2FA()`: Disables MFA
  - `generateBackupCodes()`: Creates backup codes

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
