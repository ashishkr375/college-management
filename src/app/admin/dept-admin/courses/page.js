'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CourseList from '@/components/courses/CourseList';
import AddCourseDialog from '@/components/courses/AddCourseDialog';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function CourseManagementPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dept-admin/dashboard' },
    { label: 'Course Management', href: '/admin/dept-admin/courses' }
  ];

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <AddCourseDialog onCourseAdded={() => fetchCourses()}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </AddCourseDialog>
      </div>

      <CourseList />
    </div>
  );
} 