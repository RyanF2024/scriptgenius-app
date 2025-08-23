'use client';

import { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { PageLoading } from '@/components/ui/loading/PageLoading';

type LazyComponentProps = {
  [key: string]: any;
};

export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: ReactNode = <PageLoading />
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: LazyComponentProps) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
