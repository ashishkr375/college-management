import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { 
  PieChart, 
  BarChart, 
  Building2, 
  GraduationCap, 
  Users, 
  LayoutGrid,
  BookOpen,
  UserPlus,
  FolderPlus,
  Settings,
  FileSpreadsheet,
  UserSquare2
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import DepartmentDistribution from '@/components/charts/DepartmentDistribution';
import StudentGrowth from '@/components/charts/StudentGrowth';
import { fetchDashboardStats } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session.user.role !== 'super_admin') {
    redirect('/unauthorized');
  }

  const stats = await fetchDashboardStats();

  const quickActions = [
    {
      title: 'Manage Departments',
      description: 'Add, edit, or remove academic departments',
      icon: <Building2 className="w-6 h-6" />,
      href: '/admin/super-admin/departments',
    },
    {
      title: 'Manage Programmes',
      description: 'Configure academic programmes and courses',
      icon: <BookOpen className="w-6 h-6" />,
      href: '/admin/super-admin/programmes',
    },
    {
      title: 'Manage Batches',
      description: 'Create and organize student batches',
      icon: <GraduationCap className="w-6 h-6" />,
      href: '/admin/super-admin/batches',
    },
    {
      title: 'Manage Sections',
      description: 'Configure class sections and capacities',
      icon: <LayoutGrid className="w-6 h-6" />,
      href: '/admin/super-admin/sections',
    },
    {
      title: 'Manage Faculty',
      description: 'Add and assign faculty members',
      icon: <Users className="w-6 h-6" />,
      href: '/admin/super-admin/faculty',
    },
    {
      title: 'Manage Students',
      description: 'Add and manage student records',
      icon: <GraduationCap className="w-6 h-6" />,
      href: '/admin/super-admin/students',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <div className="flex gap-2">
          {/* Add action buttons here */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Departments"
          value={stats.departmentCount}
          icon={<Building2 className="h-4 w-4" />}
          description="Active academic departments"
        />
        <StatsCard
          title="Active Programmes"
          value={stats.programmeCount}
          icon={<BookOpen className="h-4 w-4" />}
          description="Across all departments"
        />
        <StatsCard
          title="Faculty Members"
          value={stats.facultyCount}
          icon={<Users className="h-4 w-4" />}
          description="Total teaching staff"
        />
        <StatsCard
          title="Total Sections"
          value={stats.sectionCount}
          icon={<LayoutGrid className="h-4 w-4" />}
          description="Active class sections"
        />
        <StatsCard
          title="Total Students"
          value={stats.studentCount}
          icon={<UserSquare2 className="h-4 w-4" />}
          description="Enrolled students"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Department Distribution</h2>
          <DepartmentDistribution data={stats.departmentDistribution} />
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Student Growth Trend</h2>
          <StudentGrowth data={stats.studentGrowth} />
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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