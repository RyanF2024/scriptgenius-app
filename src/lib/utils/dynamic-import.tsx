'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type DynamicImportOptions = {
  loading?: () => ReactNode;
  ssr?: boolean;
  onError?: (error: Error) => void;
};

export function dynamicImport<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: DynamicImportOptions = {}
) {
  const {
    loading: Loading = () => <Skeleton className="h-[200px] w-full" />,
    ssr = false,
    onError = (error) => console.error('Failed to load component:', error),
  } = options;

  return dynamic(importFn, {
    loading: () => <Loading />,
    ssr,
  }).catch((error) => {
    onError(error);
    return () => (
      <div className="p-4 text-red-500">
        Failed to load component. Please try again later.
      </div>
    );
  });
}
