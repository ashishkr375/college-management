import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Plus, PlusCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FacultyList from '@/components/faculty/FacultyList';
import AddFacultyDialog from '@/components/faculty/AddFacultyDialog';
import ImportFacultyDialog from '@/components/faculty/ImportFacultyDialog';
import { Breadcrumb } from '@/components/Breadcrumb';

export default async function FacultyPage() {
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
            { label: 'Faculty', href: '/admin/super-admin/faculty' },
          ]}
        />
        <div className="flex gap-2">
          <ImportFacultyDialog>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Import Faculty
            </Button>
          </ImportFacultyDialog>
          <AddFacultyDialog>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Faculty
            </Button>
          </AddFacultyDialog>
        </div>
      </div>

      <FacultyList />
    </div>
  );
} 