'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function StudentDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchCourses();
    }
  }, [session]);

  async function fetchCourses() {
    try {
      const response = await fetch('/api/student/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.course_code} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{course.course_name}</h3>
                <p className="text-sm text-muted-foreground">{course.course_code}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Attendance</span>
                  <span>{course.attendance_percentage}%</span>
                </div>
                <Progress value={course.attendance_percentage} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm font-medium">Classes</p>
                  <p className="text-2xl font-bold">
                    {course.classes_attended}/{course.total_classes}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Materials</p>
                  <p className="text-2xl font-bold">{course.materials_count}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 