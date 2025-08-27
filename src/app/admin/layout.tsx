import dynamic from 'next/dynamic';
import { auth } from '@/lib/auth';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load admin components
const AdminSidebar = dynamic(
  () => import('@/components/admin/AdminSidebar'),
  { 
    loading: () => (
      <div className="w-64 h-screen bg-white border-r border-gray-200 p-4">
        <Skeleton className="h-8 w-3/4 mb-6" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
);

const AdminHeader = dynamic(
  () => import('@/components/admin/AdminHeader'),
  { 
    loading: () => (
      <div className="h-16 border-b border-gray-200 bg-white p-4 flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ),
    ssr: false
  }
);

const AdminProvider = dynamic(
  () => import('@/contexts/AdminContext').then(mod => mod.AdminProvider),
  { ssr: false }
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // TODO: Add proper admin role check
  // if (!session?.user?.isAdmin) {
  //   redirect('/unauthorized');
  // }

  return (
    <AdminProvider>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminHeader user={session?.user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
