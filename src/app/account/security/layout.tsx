import type { ReactNode } from 'react';
import { MFAProvider } from '@/contexts/MFAContext';
import { SocialProvider } from '@/contexts/SocialContext';

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return (
    <MFAProvider>
      <SocialProvider>{children}</SocialProvider>
    </MFAProvider>
  );
}
