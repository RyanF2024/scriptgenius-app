'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import './globals.css';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthAndProfileProvider } from '@/contexts/UserProfileContext';
import { Navbar } from '@/components/navbar';
import { ToastProvider } from '@/components/ui/toast/ToastProvider';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useEffect } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScriptGenius - AI-Powered Screenplay Development',
  description: 'Transform your scriptwriting process with AI-powered tools and collaboration features.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

// This is a client component that wraps the app with providers
function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <QueryProvider>
      <ErrorBoundary>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthAndProfileProvider>
            <ToastProvider>
              <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container py-8">
                  {children}
                </main>
              </div>
            </ToastProvider>
          </AuthAndProfileProvider>
        </NextThemesProvider>
      </ErrorBoundary>
    </QueryProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
