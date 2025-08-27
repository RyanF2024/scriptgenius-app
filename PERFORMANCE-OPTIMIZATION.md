# Performance Optimization Guide

This document outlines the performance optimizations implemented in the ScriptGenius application and provides guidance on maintaining and improving performance.

## Table of Contents
- [Code Splitting](#code-splitting)
- [Lazy Loading](#lazy-loading)
- [Bundle Optimization](#bundle-optimization)
- [Performance Monitoring](#performance-monitoring)
- [Optimization Scripts](#optimization-scripts)
- [Best Practices](#best-practices)

## Code Splitting

ScriptGenius uses Next.js automatic code splitting and dynamic imports to load only the necessary JavaScript for each page.

### Dynamic Imports

Use the `lazyLoad` utility for code-splitting components:

```typescript
import { lazyLoad } from '@/lib/utils/lazy-load';

// Lazy load a component
const HeavyComponent = lazyLoad(() => import('@/components/HeavyComponent'));

// Usage in your component
function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <HeavyComponent />
    </div>
  );
}
```

## Lazy Loading

### Component Lazy Loading

Components can be lazy loaded using the `lazyLoad` utility:

```typescript
const PDFViewer = lazyLoad(
  () => import('@/components/PDFViewer'),
  {
    loading: () => <Spinner />,
    ssr: false // Disable SSR for this component
  }
);
```

### Route-Based Lazy Loading

For route-based code splitting, use the `lazyRoute` utility:

```typescript
const ProfilePage = lazyRoute(
  () => import('@/app/profile/page'),
  { loading: () => <PageLoader /> }
);
```

## Bundle Optimization

### Analyzing Bundle Size

To analyze the bundle size:

```bash
# Generate bundle analysis
npm run analyze

# Or for a detailed report
npm run analyze:bundle
```

### Optimizing Dependencies

To identify and optimize dependencies:

```bash
# Analyze dependencies
npm run optimize

# Apply optimizations
npm run optimize:apply
```

## Performance Monitoring

### Web Vitals

ScriptGenius includes Web Vitals monitoring. The metrics are automatically collected and can be sent to your analytics service.

### Profiling

To profile the application in development:

```bash
# Run the app with profiling enabled
npm run profile
```

## Optimization Scripts

- `npm run analyze` - Run bundle analysis
- `npm run analyze:bundle` - Detailed bundle analysis
- `npm run optimize` - Analyze dependencies for optimization
- `npm run optimize:apply` - Apply dependency optimizations
- `npm run profile` - Run app with profiling enabled

## Best Practices

1. **Use Dynamic Imports** for large components
2. **Optimize Images** using Next.js Image component
3. **Enable Compression** for production builds
4. **Use React.memo** for expensive components
5. **Avoid Large Dependencies** - prefer smaller alternatives
6. **Enable Lazy Loading** for below-the-fold content
7. **Monitor Performance** using Web Vitals

## Performance Budget

Keep an eye on these metrics:
- First Contentful Paint (FCP) < 1.8s
- Time to Interactive (TTI) < 3.5s
- Total Blocking Time (TBT) < 200ms
- Cumulative Layout Shift (CLS) < 0.1

## Troubleshooting

If you experience performance issues:
1. Run `npm run analyze` to identify large dependencies
2. Check for duplicate dependencies with `npm run optimize`
3. Use Chrome DevTools to identify performance bottlenecks
4. Consider using React Profiler for component-level optimization

## Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [React Optimization Techniques](https://reactjs.org/docs/optimizing-performance.html)
