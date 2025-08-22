import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize the rate limiter with Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create a rate limiter with different limits for different endpoints
export const rateLimiters = {
  // Strict rate limiting for auth endpoints
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
    prefix: 'ratelimit:auth',
  }),
  // Default rate limiting for API endpoints
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
    prefix: 'ratelimit:api',
  }),
  // More lenient rate limiting for public endpoints
  public: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    prefix: 'ratelimit:public',
  }),
};

type RateLimiterType = keyof typeof rateLimiters;

interface RateLimitOptions {
  type?: RateLimiterType;
  identifier?: string; // Defaults to IP address
  onRateLimited?: (response: Response) => void;
}

export async function rateLimit(
  request: Request,
  options: RateLimitOptions = { type: 'api' }
) {
  const { type = 'api', identifier, onRateLimited } = options;
  const limiter = rateLimiters[type];
  
  // Use the provided identifier or fall back to IP address
  const id = identifier || request.headers.get('x-forwarded-for') || 'anonymous';
  
  const { success, limit, reset, remaining } = await limiter.limit(id);
  
  // Add rate limit headers to the response
  const headers = new Headers({
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  });
  
  if (!success) {
    const response = new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers.entries()),
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
    
    if (onRateLimited) {
      onRateLimited(response);
    }
    
    return { success: false, response };
  }
  
  return { success: true, headers };
}

// Helper function to use in API routes
export const withRateLimit = async (
  request: Request,
  handler: () => Promise<Response>,
  options?: RateLimitOptions
) => {
  const { success, response, headers } = await rateLimit(request, options);
  
  if (!success) {
    return response;
  }
  
  try {
    const result = await handler();
    
    // Add rate limit headers to the successful response
    if (headers) {
      headers.forEach((value, key) => {
        result.headers.set(key, value);
      });
    }
    
    return result;
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
