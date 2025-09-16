# ScriptGenius Threat Model

This document outlines potential security threats to the ScriptGenius application and the corresponding mitigation strategies. It is aligned with the latest security implementations including MFA, rate limiting, and secure session management.

## Table of Contents
- [Overview](#overview)
- [Attack Surface](#attack-surface)
- [Threats & Mitigations](#threats--mitigations)
- [Security Controls](#security-controls)
- [MFA Implementation](#mfa-implementation)
- [Rate Limiting Strategy](#rate-limiting-strategy)
- [Incident Response](#incident-response)
- [Third-Party Dependencies](#third-party-dependencies)
- [Audit Logging](#audit-logging)

## Overview

ScriptGenius is a web application that handles user authentication, file uploads, and profile management. This document identifies potential security threats and outlines strategies to mitigate them.

## Attack Surface

### Entry Points
1. **Web Interface**
   - Login/Registration forms
   - File upload functionality
   - API endpoints
   - Admin interfaces

2. **Authentication**
   - Credential submission
   - Password reset flows
   - MFA setup and verification
   - Session management

3. **Data Storage**
   - Database access
   - File storage (Supabase)
   - Caching layers

## Threats & Mitigations

### 1. Authentication Bypass

**Threat**: Attackers may attempt to bypass authentication mechanisms.

**Mitigations**:
- Implement proper session management with secure cookies
- Enforce MFA for all sensitive operations
- Rate limit authentication attempts
- Implement account lockout after failed attempts
- Use secure password policies

### 2. Cross-Site Scripting (XSS)

**Threat**: Malicious scripts injected into web pages.

**Mitigations**:
- Implement Content Security Policy (CSP)
- Use React's built-in XSS protections
- Sanitize all user inputs
- Set secure HTTP headers
  ```
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  ```

### 3. Cross-Site Request Forgery (CSRF)

**Threat**: Unauthorized commands from a trusted user.

**Mitigations**:
- Use SameSite cookie attribute
- Implement CSRF tokens for state-changing operations
- Validate Origin and Referer headers
- Use framework-provided CSRF protections

### 4. SQL Injection

**Threat**: Malicious SQL queries through user input.

**Mitigations**:
- Use parameterized queries
- Implement ORM with built-in protection
- Limit database permissions
- Regular security audits

### 5. File Upload Vulnerabilities

**Threat**: Malicious file uploads leading to RCE or XSS.

**Mitigations**:
- Validate file types and content
- Store files with random names
- Serve files with proper Content-Type headers
- Scan files for malware
- Store files outside web root

## Security Controls

### 1. Authentication & Session Management

#### JWT Authentication
- Short-lived access tokens (15 minutes)
- Refresh tokens with rotation
- Token invalidation on logout
- Secure cookie settings (HttpOnly, Secure, SameSite)

#### Session Security
- Inactive session timeout: 24 hours
- Absolute session lifetime: 7 days
- Force re-authentication for sensitive operations
- Session invalidation on:
  - Password change
  - Email change
  - Logout from all devices
  - Suspicious activity

#### Implementation Example
```typescript
// Secure authentication middleware with MFA check
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if MFA is required
    if (user.mfaEnabled && !req.session.mfaVerified) {
      return res.status(403).json({ 
        error: 'MFA verification required',
        requiresMfa: true
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Rate Limiting Strategy

### Implementation

```typescript
// Rate limiting configuration using @upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create rate limiters for different endpoints
const rateLimiters = {
  auth: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
  upload: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:upload',
  }),
  // Add more rate limiters as needed
};

export async function checkRateLimit(identifier: string, endpoint: keyof typeof rateLimiters) {
  const { success, limit, remaining, reset } = await rateLimiters[endpoint].limit(identifier);
  
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

### Rate Limits

| Endpoint | Limit | Window | Scope |
|----------|-------|--------|-------|
| `/api/auth/*` | 10 | 1 minute | IP + User Agent |
| `/api/upload` | 5 | 1 minute | User ID |
| `/api/mfa/*` | 5 | 15 minutes | User ID |
| `/api/*` | 100 | 15 minutes | IP |

### Response Headers
- `X-RateLimit-Limit`: Maximum requests allowed in the time window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets
- `Retry-After`: Seconds to wait before making a new request (when rate limited)
```

## MFA Implementation

### TOTP Configuration
- **Algorithm**: SHA-1
- **Code Length**: 6 digits
- **Time Step**: 30 seconds
- **Verification Window**: ±1 time step

### Security Features
- Rate limiting: 5 attempts per 15 minutes
- Account lockout after 3 failed attempts (30-minute lockout)
- Session invalidation on MFA reset
- Backup codes (12-char format: XXXX-XXXX-XXXX)
- Email notifications for MFA events

### Database Schema
```sql
-- MFA factors
CREATE TABLE mfa_factors (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  factor_type TEXT NOT NULL,
  secret TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup codes (hashed)
CREATE TABLE mfa_backup_codes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);
```

## Input Validation & Sanitization

### Client-Side Validation
```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// User input schema
const userSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  // Additional fields...
});

// Sanitize HTML input
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
};

// Validate and sanitize user input
const validateUserInput = (input: unknown) => {
  const result = userSchema.safeParse(input);
  if (!result.success) {
    throw new Error('Validation failed');
  }
  
  // Sanitize string fields
  const sanitized = { ...result.data };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    }
  }
  
  return sanitized;
};
```

## Incident Response

### 1. Detection
- Monitor for unusual activity
- Set up alerts for security events
- Regular security audits

### 2. Response
1. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IPs

2. **Eradication**
   - Identify and patch vulnerabilities
   - Remove malicious content
   - Update security controls

3. **Recovery**
   - Restore from clean backups
   - Reset affected credentials
   - Monitor for recurrence

4. **Post-Mortem**
   - Document the incident
   - Identify root cause
   - Update security policies
   - Train staff on lessons learned

## Audit Logging

### Logged Events
- Authentication attempts (success/failure)
- MFA setup and verification
- Password changes
- Sensitive operations (profile updates, etc.)
- Security-related configuration changes

### Log Format
```typescript
interface AuditLogEntry {
  timestamp: string; // ISO 8601 format
  eventType: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
}
```

### Retention Policy
- Logs are retained for 1 year
- Sensitive data is redacted
- Logs are stored in a secure, access-controlled location

## Third-Party Dependencies

### 1. Management
- Dependabot for automated dependency updates
- Weekly security audits using `npm audit`
- Automated security scanning in CI/CD pipeline
- Pin all dependency versions

### 2. Critical Dependencies
| Category | Dependencies | Purpose |
|----------|--------------|---------|
| Authentication | @supabase/auth-helpers-nextjs, @supabase/supabase-js | User authentication and session management |
| Security | helmet, @upstash/ratelimit, bcryptjs | Security headers, rate limiting, password hashing |
| Validation | zod, yup | Input validation and type safety |
| Monitoring | @sentry/nextjs | Error tracking and monitoring |

### 3. Monitoring
- GitHub Dependabot for security alerts
- Snyk for vulnerability scanning
- Weekly dependency updates
- Automated security patches

### 4. Vulnerability Management
- Critical vulnerabilities patched within 24 hours
- High severity within 72 hours
- Medium and low severity within 2 weeks
- Have a rollback plan for critical updates

## Security Headers

```typescript
// Example: Security headers middleware
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.scriptgenius.com'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  referrerPolicy: {
    policy: 'same-origin'
  }
}));
```

## Secure Development Lifecycle

1. **Requirements**
   - Define security requirements
   - Identify sensitive data
   - Plan security testing

2. **Design**
   - Threat modeling
   - Security architecture review
   - Security controls design

3. **Implementation**
   - Secure coding practices
   - Code reviews
   - Static analysis

4. **Testing**
   - Penetration testing
   - Vulnerability scanning
   - Security regression testing

5. **Deployment**
   - Secure configuration
   - Least privilege principle
   - Monitoring and logging

6. **Maintenance**
   - Regular updates
   - Security patches
   - Ongoing monitoring
