import { UsersTable } from '@/components/admin/users/UsersTable';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all users and their permissions"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </PageHeader>

      <div className="rounded-md border bg-white">
        <UsersTable />
      </div>
    </div>
  );
}
