import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminProvider } from '@/contexts/AdminContext';
import { auth } from '@/lib/auth';

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
