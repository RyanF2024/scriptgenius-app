import { ReactNode } from 'react';
import { AccountNav } from '@/components/account/AccountNav';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container">
          <AccountNav />
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
