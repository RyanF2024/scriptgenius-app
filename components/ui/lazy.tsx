import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { Skeleton } from './skeleton';

type DynamicImport = () => Promise<{ default: ComponentType<any> }>;

export function lazyLoad<P = {}>(
  importStatement: DynamicImport,
  { ssr = false }: { ssr?: boolean } = {}
) {
  return dynamic(importStatement, {
    ssr,
    loading: () => <Skeleton className="w-full h-32" />,
  });
}
