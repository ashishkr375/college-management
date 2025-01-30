import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentList from '@/components/students/StudentList';
import AddStudentDialog from '@/components/students/AddStudentDialog';
import ImportStudentsDialog from '@/components/students/ImportStudentsDialog';
import { Breadcrumb } from '@/components/Breadcrumb';

export default async function StudentsPage() {
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
            { label: 'Students', href: '/admin/super-admin/students' },
          ]}
        />
        <div className="flex gap-2">
          <AddStudentDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </AddStudentDialog>
          <ImportStudentsDialog>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </ImportStudentsDialog>
        </div>
      </div>

      <StudentList />
    </div>
  );
} 