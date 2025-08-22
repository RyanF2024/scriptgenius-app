interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryOn?: (error: any) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryOn = () => true,
  } = options;

  let retries = 0;
  let currentDelay = initialDelay;

  const execute = async (): Promise<T> => {
    try {
      return await fn();
    } catch (error: any) {
      // Don't retry if we've reached max retries or if the error shouldn't be retried
      if (retries >= maxRetries || !retryOn(error)) {
        throw error;
      }

      retries++;
      
      // Calculate delay with exponential backoff and jitter
      const jitter = Math.random() * 1000; // Add up to 1s of jitter
      const delay = Math.min(
        currentDelay * Math.pow(backoffFactor, retries - 1) + jitter,
        maxDelay
      );

      // Wait for the delay before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      // Update current delay for next retry (if any)
      currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);
      
      return execute();
    }
  };

  return execute();
}

// Helper function for common HTTP status codes that are typically retryable
export function isRetryableHttpError(error: any): boolean {
  // Network errors
  if (!error.response) {
    return true;
  }

  const status = error.response.status;
  
  // Retry on these status codes
  const retryableStatuses = [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ];

  return retryableStatuses.includes(status);
}

// Example usage:
/*
const fetchWithRetry = async (url: string) => {
  return withRetry(
    async () => {
      const response = await fetch(url);
      if (!response.ok) {
        const error: any = new Error(`HTTP error! status: ${response.status}`);
        error.response = response;
        throw error;
      }
      return response.json();
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      retryOn: isRetryableHttpError,
    }
  );
};
*/
