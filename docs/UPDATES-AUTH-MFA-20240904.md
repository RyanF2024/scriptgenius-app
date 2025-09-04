# Authentication & MFA System Updates - September 4, 2025

## Summary of Changes

### 1. MFA Backup Code Hashing Alignment
- Aligned hashing algorithms in `generate_backup_codes` and `verify_backup_code` to use bcrypt
- Added proper user authorization checks and audit logging
- Ensured backward compatibility with existing codes

### 2. Social Account Management
- Updated `disconnectSocialAccount` to use `unlinkIdentity` instead of direct database access
- Fixed social provider name consistency (Microsoft → Azure)
- Improved error handling and user feedback

### 3. Security Improvements
- Added `SET search_path = public` to all SECURITY DEFINER functions
- Fixed backup code generation to properly handle XXXX-XXXX-XXXX format
- Updated API response codes for better client handling

### 4. TypeScript & Code Quality
- Added type-only imports where appropriate
- Fixed TypeScript errors in social account management
- Improved function documentation and error messages

## Updated API Reference

### MFA Hooks

#### `useMFA()`
```typescript
const { 
  verify2FASetup,    // Verify MFA setup with a code
  generateNewBackupCodes, // Generate new backup codes
  disable2FA,        // Disable MFA for the current user
  // ... other methods
} = useMFA();

// Example: Verify MFA setup
const handleVerify = async (code: string) => {
  const isValid = await verify2FASetup(code);
  if (isValid) {
    // Proceed with MFA setup completion
  }
};

// Example: Generate new backup codes
const handleRegenerateCodes = async () => {
  const newCodes = await generateNewBackupCodes();
  // Show new codes to user
};
```

### Storage Service

#### `deleteFile(filePath: string)`
Now handles both public URLs and relative paths:
```typescript
// Both of these will work:
await storageService.deleteFile('avatars/user123/avatar.jpg');
await storageService.deleteFile('https://example.com/storage/v1/object/public/avatars/user123/avatar.jpg');
```

## Migration Notes

### Database Migrations
1. **20240904140000_fix_mfa_backup_code_verification.sql**
   - Fixed backup code verification to use proper hash comparison

2. **20240904150000_fix_mfa_security_issues.sql**
   - Added security checks to MFA functions
   - Improved audit logging

3. **20240904160000_align_backup_code_hashing.sql**
   - Aligned hashing algorithms for backup codes
   - Added proper user authorization checks

## Known Issues & Future Work
- [ ] Review and update all SECURITY DEFINER functions for proper search_path settings
- [ ] Add rate limiting for MFA verification attempts
- [ ] Implement account lockout after multiple failed MFA attempts

## Testing Notes
1. Verify MFA setup and verification flow
2. Test backup code generation and verification
3. Verify social account linking/unlinking
4. Test file upload and deletion with both URLs and paths

## Rollback Plan
If issues are discovered:
1. Revert database migrations in reverse order
2. Rollback to previous version of the authentication service
3. Clear any cached authentication tokens on the client
