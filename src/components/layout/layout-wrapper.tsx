'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/navbar';

type LayoutWrapperProps = {
  children: ReactNode;
};

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
