import { type ErrorInfo } from 'react';

export type ErrorContext = Record<string, unknown>;

export interface ErrorReport {
  error: Error;
  errorInfo?: ErrorInfo;
  context?: ErrorContext;
  timestamp: string;
  user?: {
    id?: string;
    email?: string;
  };
  page?: string;
  componentStack?: string;
}

/**
 * Report an error to your error tracking service
 * @param error The error that occurred
 * @param errorInfo Additional error information from React
 * @param context Additional context about the error
 */
export async function reportError(
  error: Error,
  errorInfo?: ErrorInfo,
  context: ErrorContext = {}
): Promise<void> {
  const report: ErrorReport = {
    error,
    errorInfo,
    context,
    timestamp: new Date().toISOString(),
    page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    componentStack: errorInfo?.componentStack,
  };

  try {
    // In a real app, you would send this to your error tracking service
    // e.g., Sentry, LogRocket, etc.
    console.error('Error reported:', report);
    
    // Example: Send to an API endpoint
    // await fetch('/api/report-error', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(report),
    // });
  } catch (e) {
    // If there's an error reporting the error, log it to the console
    console.error('Error reporting error:', e);
  }
}

/**
 * Create a custom error class for specific error types
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): never {
  if (error instanceof AppError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new AppError(
      error.message || 'An unknown error occurred',
      'UNKNOWN_ERROR',
      500
    );
  }

  throw new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500);
}

/**
 * Handle form errors consistently
 */
export function handleFormError(
  error: unknown,
  setError?: (field: string, error: { type: string; message: string }) => void,
  defaultMessage = 'An error occurred. Please try again.'
): void {
  if (error instanceof AppError) {
    if (setError && error.code === 'VALIDATION_ERROR' && error.context?.fields) {
      // Handle validation errors
      const fields = error.context.fields as Record<string, string>;
      Object.entries(fields).forEach(([field, message]) => {
        setError(field, {
          type: 'manual',
          message,
        });
      });
    } else {
      // Show error message to user
      console.error('Form error:', error.message);
      // You might want to show this in a toast or alert
      // toast.error(error.message || defaultMessage);
    }
  } else {
    console.error('Unknown form error:', error);
    // toast.error(defaultMessage);
  }
}

/**
 * Handle network errors
 */
export function handleNetworkError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      throw new AppError(
        'Unable to connect to the server. Please check your internet connection and try again.',
        'NETWORK_ERROR',
        0
      );
    }
    
    if (error.message.includes('timeout')) {
      throw new AppError(
        'The request timed out. Please try again.',
        'REQUEST_TIMEOUT',
        408
      );
    }
  }
  
  throw new AppError(
    'A network error occurred. Please try again.',
    'NETWORK_ERROR',
    0
  );
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: unknown): never {
  if (error instanceof AppError) {
    throw error;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('auth/invalid-email')) {
      throw new AppError('Invalid email address', 'INVALID_EMAIL', 400);
    }
    
    if (error.message.includes('auth/user-not-found')) {
      throw new AppError('No user found with this email', 'USER_NOT_FOUND', 404);
    }
    
    if (error.message.includes('auth/wrong-password')) {
      throw new AppError('Incorrect password', 'WRONG_PASSWORD', 401);
    }
    
    if (error.message.includes('auth/email-already-in-use')) {
      throw new AppError('Email already in use', 'EMAIL_IN_USE', 400);
    }
    
    if (error.message.includes('auth/weak-password')) {
      throw new AppError('Password is too weak', 'WEAK_PASSWORD', 400);
    }
    
    if (error.message.includes('auth/too-many-requests')) {
      throw new AppError(
        'Too many failed login attempts. Please try again later or reset your password.',
        'TOO_MANY_REQUESTS',
        429
      );
    }
  }
  
  throw new AppError('Authentication failed', 'AUTH_ERROR', 401);
}
