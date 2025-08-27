import { ComponentType, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type ImportFunc<T> = () => Promise<{ default: ComponentType<T> }>;

type LazyOptions = {
  loading?: () => React.ReactNode;
  ssr?: boolean;
};

export function lazyLoad<T = any>(
  importFunc: ImportFunc<T>,
  options: LazyOptions = {}
): React.LazyExoticComponent<ComponentType<T>> {
  const { loading: Loading = () => <Skeleton className="h-[200px] w-full" />, ssr = false } = options;

  const LazyComponent = lazy(importFunc);

  // Wrap with Suspense for loading state
  const ComponentWithSuspense = (props: T) => (
    <Suspense fallback={<Loading />}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  );

  // Add display name for better debugging
  const componentName = importFunc.name.replace(/^_?dynamic_/, '') || 'LazyLoadedComponent';
  ComponentWithSuspense.displayName = componentName;

  // @ts-ignore - TypeScript doesn't understand dynamic imports well
  return ComponentWithSuspense;
}

// Helper for route-based code splitting
export function lazyRoute<T = any>(
  importFunc: ImportFunc<T>,
  options: Omit<LazyOptions, 'ssr'> = {}
) {
  return lazyLoad(importFunc, { ...options, ssr: false });
}

// Helper for component-based code splitting
export function lazyComponent<T = any>(
  importFunc: ImportFunc<T>,
  options: Omit<LazyOptions, 'ssr'> = {}
) {
  return lazyLoad(importFunc, { ...options, ssr: true });
}
