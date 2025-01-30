import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BatchList from '@/components/batches/BatchList';
import AddBatchDialog from '@/components/batches/AddBatchDialog';
import { Breadcrumb } from '@/components/Breadcrumb';

export default async function BatchesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session.user.role !== 'super_admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/admin/super-admin/dashboard' },
            { label: 'Batches', href: '/admin/super-admin/batches' },
          ]}
        />
        <AddBatchDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Batch
          </Button>
        </AddBatchDialog>
      </div>

      <BatchList />
    </div>
  );
} 