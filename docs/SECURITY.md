# Security Best Practices

This document outlines the security measures implemented in the ScriptGenius application to protect user data and ensure secure operations.

## Table of Contents
- [File Upload Security](#file-upload-security)
- [Rate Limiting](#rate-limiting)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Security Headers](#security-headers)
- [Monitoring & Logging](#monitoring--logging)

## File Upload Security

### Validation Rules

1. **File Type Validation**
   - Only allow specific MIME types:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
   - Verify file signatures (magic numbers)
   - Reject files with double extensions (e.g., `malicious.jpg.php`)

2. **File Size Limits**
   - Maximum file size: 5MB per file
   - Maximum dimensions: 4000x4000 pixels
   - Maximum number of files: 10 per request

3. **File Content Validation**
   ```typescript
   import fileType from 'file-type';
   
   async function validateFileContent(buffer: Buffer, allowedTypes: string[]) {
     const type = await fileType.fromBuffer(buffer);
     if (!type || !allowedTypes.includes(type.mime)) {
       throw new Error('Invalid file type');
     }
     return type.mime;
   }
   ```

### Secure Storage

1. **File Naming**
   - Generate random filenames
   - Store original filenames in the database
   - Use content-disposition headers for downloads

2. **Access Control**
   - Store files outside the web root
   - Use signed URLs for file access
   - Implement proper file permissions

3. **Virus Scanning**
   - Integrate with ClamAV or similar
   - Quarantine suspicious files
   - Regular signature updates

## Rate Limiting

### API Rate Limits

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| `/api/auth/*` | 10 | 1 minute | IP + User Agent |
| `/api/upload` | 5 | 1 minute | User ID |
| `/api/profile/avatar` | 3 | 1 minute | User ID |
| `/api/*` | 100 | 15 minutes | IP |

### Implementation

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter, that allows 5 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'ratelimit:profile',
});

export async function rateLimitRequest(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
  
  return {
    success,
    limit,
    remaining,
    reset,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  };
}
```

### Rate Limit Headers

- `X-RateLimit-Limit`: Maximum requests allowed in the time window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets
- `Retry-After`: Seconds to wait before making a new request (when rate limited)

## Authentication & Authorization

### Session Management

- Use HTTP-only, Secure, SameSite cookies
- Session timeout: 24 hours (configurable)
- Invalidate sessions on:
  - Password change
  - Email change
  - Logout from all devices
  - Suspicious activity

### Multi-Factor Authentication

- TOTP (Time-based One-Time Password)
- Backup codes (one-time use)
- Rate limiting on failed attempts
- Session invalidation on MFA reset

## Data Protection

### Encryption

- Data at rest: AES-256 encryption
- Data in transit: TLS 1.3
- Sensitive fields encrypted in the database:
  - API keys
  - OAuth tokens
  - Backup codes (hashed)

### Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Sanitize HTML input
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};

// Validate and sanitize user input
const userInputSchema = z.object({
  username: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/),
  bio: z.string()
    .max(500)
    .transform(sanitizeInput)
    .optional(),
});
```

## Security Headers

### Next.js Configuration

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://*.supabase.co;
      frame-ancestors 'none';
      form-action 'self';
      base-uri 'self';
    `.replace(/\s+/g, ' ').trim(),
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Monitoring & Logging

### Security Events

Log the following events:
- Failed login attempts
- Password reset requests
- Email changes
- MFA enrollment/changes
- File uploads (size, type, hash)
- Rate limit hits
- Admin actions

### Log Format

```json
{
  "timestamp": "2023-04-01T12:00:00Z",
  "level": "warn",
  "event": "failed_login",
  "userId": "user_123",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "email": "user@example.com",
    "reason": "invalid_credentials"
  }
}
```

### Alerting

Set up alerts for:
- Multiple failed login attempts
- Suspicious file uploads
- Rate limit breaches
- Unusual user activity
- Security header misconfigurations

## Regular Security Audits

1. **Dependency Scanning**
   - Weekly `npm audit`
   - Dependabot for security updates
   - Snyk integration for vulnerability scanning

2. **Penetration Testing**
   - Quarterly security assessments
   - Bug bounty program
   - Automated scanning with OWASP ZAP

3. **Compliance**
   - GDPR compliance
   - CCPA compliance
   - Regular security training for developers
