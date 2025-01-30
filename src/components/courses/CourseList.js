'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import EditCourseDialog from './EditCourseDialog';
import DeleteCourseDialog from './DeleteCourseDialog';

export default function CourseList() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchCourses();
    }
  }, [session]);

  async function fetchCourses() {
    try {
      const response = await fetch('/api/admin/dept/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Code</TableHead>
            <TableHead>Course Name</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Programme</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.course_id}>
              <TableCell>{course.course_code}</TableCell>
              <TableCell>{course.course_name}</TableCell>
              <TableCell>{course.credits}</TableCell>
              <TableCell>{course.programme_name}</TableCell>
              <TableCell className="space-x-2">
                <EditCourseDialog course={course} onCourseUpdated={fetchCourses}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </EditCourseDialog>
                <DeleteCourseDialog 
                  courseId={course.course_id} 
                  courseName={course.course_name}
                  onCourseDeleted={fetchCourses}
                >
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </DeleteCourseDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 