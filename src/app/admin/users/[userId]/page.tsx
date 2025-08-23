import { notFound } from 'next/navigation';
import { UserForm } from '@/components/admin/users/UserForm';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/api/users';

export default async function UserDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await getUser(params.userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Edit User"
          description={`Update ${user.name}'s details and permissions`}
        >
          <Button asChild variant="outline" className="mb-6">
            <Link href="/admin/users" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </PageHeader>
      </div>

      <div className="rounded-md border bg-white p-6">
        <UserForm user={user} />
      </div>
    </div>
  );
}
