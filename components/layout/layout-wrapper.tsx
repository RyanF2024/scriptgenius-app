'use client';

import { ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

// Lazy load the main navigation
const MainNav = dynamic(
  () => import('@/components/main-nav'),
  { 
    ssr: false,
    loading: () => <div className="w-full h-16 bg-muted animate-pulse" />
  }
);

// Lazy load the site footer
const SiteFooter = dynamic(
  () => import('@/components/site-footer'),
  { 
    ssr: false,
    loading: () => <div className="w-full h-24 bg-muted animate-pulse" />
  }
);

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="relative flex min-h-screen flex-col">
        <Suspense fallback={<Skeleton className="w-full h-16" />}>
          <MainNav />
        </Suspense>
        <main className="flex-1">
          <Suspense fallback={<Skeleton className="w-full h-[calc(100vh-8rem)]" />}>
            {children}
          </Suspense>
        </main>
        <Suspense fallback={<Skeleton className="w-full h-24" />}>
          <SiteFooter />
        </Suspense>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
