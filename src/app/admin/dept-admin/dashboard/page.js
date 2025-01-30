import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  Calendar,
  ClipboardList,
  BookOpenCheck,
  UserCog
} from 'lucide-react';
import Link from 'next/link';
import StatsCard from '@/components/StatsCard';
import { fetchDeptAdminStats } from '@/lib/data';
import { authOptions } from '@/lib/auth';

export default async function DeptAdminDashboard() {
  const session = await getServerSession(authOptions);
  
  console.log('Department Admin Dashboard - Session:', session);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'dept_admin') {
    console.log('Unauthorized access attempt - User role:', session.user.role);
    redirect('/unauthorized');
  }

  const stats = await fetchDeptAdminStats(session.user.id);

  const quickActions = [
    {
      title: 'Course Management',
      description: 'Add, edit, or remove courses',
      href: '/admin/dept-admin/courses',
      icon: <BookOpenCheck className="h-6 w-6" />
    },
    {
      title: 'Faculty Course Assignments',
      description: 'Assign courses to faculty members',
      href: '/admin/dept-admin/course-assignments',
      icon: <UserCog className="h-6 w-6" />
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Department Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={stats.studentCount}
          icon={<Users className="h-6 w-6" />}
          description="Active students in department"
        />
        <StatsCard
          title="Active Courses"
          value={stats.courseCount}
          icon={<BookOpen className="h-6 w-6" />}
          description="Current semester courses"
        />
        <StatsCard
          title="Faculty Members"
          value={stats.facultyCount}
          icon={<Users className="h-6 w-6" />}
          description="Teaching staff"
        />
        <StatsCard
          title="Sections"
          value={stats.sectionCount}
          icon={<ClipboardList className="h-6 w-6" />}
          description="Active class sections"
        />
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {action.icon}
                </div>
                <div>
                  <h2 className="font-semibold">{action.title}</h2>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
} 