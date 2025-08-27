# Performance Optimizations Guide

This document outlines the performance optimizations implemented in the ScriptGenius application to ensure fast load times, smooth interactions, and efficient resource usage.

## Table of Contents
1. [Image Optimization](#image-optimization)
2. [Form Handling](#form-handling)
3. [API Request Optimization](#api-request-optimization)
4. [Supabase Client](#supabase-client)
5. [State Management](#state-management)
6. [Best Practices](#best-practices)

## Image Optimization

### OptimizedImage Component

```tsx
import OptimizedImage from '@/components/ui/OptimizedImage';

// Basic usage
<OptimizedImage 
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
  blurDataURL="data:image/svg+xml;base64,..."
/>
```

**Features:**
- Automatic format optimization (WebP, AVIF)
- Lazy loading
- Blur-up placeholders
- Responsive sizing
- SVG support

## Form Handling

### useOptimizedFormSubmit Hook

```tsx
const { handleSubmit, isSubmitting, error } = useOptimizedFormSubmit(
  async (data) => {
    await api.submitForm(data);
  },
  {
    successMessage: 'Success!',
    errorMessage: 'Failed to submit',
    onSuccess: (data) => { /* handle success */ },
    onError: (error) => { /* handle error */ }
  }
);
```

## API Request Optimization

### optimizedFetch Utility

```tsx
import { optimizedFetch } from '@/lib/api/optimizedFetcher';

// Basic GET request with caching
const data = await optimizedFetch<ResponseType>('/api/endpoint');

// POST request without caching
const result = await optimizedFetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
  useCache: false
});

// With custom timeout
const result = await optimizedFetch('/api/slow-endpoint', {
  timeout: 30000 // 30 seconds
});
```

## Supabase Client

### Client-Side Usage

```tsx
import { useSupabaseClient } from '@/lib/supabase/optimizedClient';

function MyComponent() {
  const supabase = useSupabaseClient();
  // Use supabase client...
}
```

### Server-Side Usage

```ts
import { createClient } from '@/lib/supabase/optimizedClient';

export async function getServerSideProps() {
  const supabase = createClient();
  // Use supabase client...
}
```

## State Management

### Optimized Context Providers

All context providers are optimized with:
- Memoized values
- Proper cleanup
- Error boundaries
- Type safety

## Best Practices

1. **Images**
   - Always specify width and height
   - Use `priority` for above-the-fold images
   - Provide `blurDataURL` for better UX
   - Prefer WebP/AVIF formats

2. **Forms**
   - Use `useOptimizedFormSubmit` for all forms
   - Implement proper loading states
   - Show meaningful error messages

3. **API Requests**
   - Use `optimizedFetch` for all API calls
   - Set appropriate timeouts
   - Handle errors gracefully

4. **Performance Monitoring**
   - Monitor bundle size
   - Track Core Web Vitals
   - Use React DevTools Profiler

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| LCP    | < 2.5s | TBD     |
| FID    | < 100ms| TBD     |
| CLS    | < 0.1  | TBD     |

## Troubleshooting

### Common Issues
1. **Images not loading**
   - Check file paths
   - Verify image optimization config
   - Check CORS settings

2. **Slow API responses**
   - Check network tab
   - Verify caching is working
   - Check server response times

3. **Memory leaks**
   - Check for missing cleanup
   - Verify event listeners are removed
   - Use React DevTools profiler

For additional help, refer to the [React Performance Documentation](https://reactjs.org/docs/optimizing-performance.html).
