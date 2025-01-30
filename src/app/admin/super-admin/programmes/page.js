import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgrammeList from '@/components/programmes/ProgrammeList';
import AddProgrammeDialog from '@/components/programmes/AddProgrammeDialog';
import { Breadcrumb } from '@/components/Breadcrumb';

export default async function ProgrammesPage() {
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
            { label: 'Programmes', href: '/admin/super-admin/programmes' },
          ]}
        />
        <AddProgrammeDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Programme
          </Button>
        </AddProgrammeDialog>
      </div>

      <ProgrammeList />
    </div>
  );
} 