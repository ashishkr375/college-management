'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, Calendar, LineChart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StudentDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [marksSummary, setMarksSummary] = useState([]);

  useEffect(() => {
    if (session?.user) {
      fetchCourses();
      fetchAttendanceSummary();
      fetchMarksSummary();
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

  async function fetchAttendanceSummary() {
    try {
      const response = await fetch('/api/student/attendance/summary');
      if (!response.ok) throw new Error('Failed to fetch attendance summary');
      const data = await response.json();
      setAttendanceSummary(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance summary",
        variant: "destructive",
      });
    }
  }

  async function fetchMarksSummary() {
    try {
      const response = await fetch('/api/student/marks/summary');
      if (!response.ok) throw new Error('Failed to fetch marks summary');
      const data = await response.json();
      setMarksSummary(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load marks summary",
        variant: "destructive",
      });
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

      {/* Course Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.course_code} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{course.course_name}</h3>
                <p className="text-sm text-muted-foreground">{course.course_code}</p>
                <p className="text-sm text-muted-foreground">Faculty: {course.faculty_name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Attendance</span>
                  <span>{course.attendance_percentage}%</span>
                </div>
                <Progress value={course.attendance_percentage} />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <p className="text-sm font-medium">Classes</p>
                  <p className="text-xl font-bold">
                    {course.classes_attended}/{course.total_classes}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Materials</p>
                  <p className="text-xl font-bold">{course.materials_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Latest Marks</p>
                  <p className="text-xl font-bold">{course.latest_marks || '-'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                {/* <Link href={`/student/attendance/${course.course_id}`}>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Attendance
                  </Button>
                </Link> */}
                <Link href={`/student/marks/${course.course_id}`}>
                  <Button variant="outline" size="sm">
                    <LineChart className="h-4 w-4 mr-2" />
                    Marks
                  </Button>
                </Link>
                <Link href={`/student/materials/${course.course_id}`}>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Materials
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Attendance Summary Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Attendance Summary</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Total Classes</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Leave</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceSummary.map((record) => (
                <TableRow key={record.course_code}>
                  <TableCell>{record.course_code}</TableCell>
                  <TableCell>{record.course_name}</TableCell>
                  <TableCell>{record.total_classes}</TableCell>
                  <TableCell className="text-green-600">{record.present}</TableCell>
                  <TableCell className="text-red-600">{record.absent}</TableCell>
                  <TableCell className="text-yellow-600">{record.leave}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={record.percentage} className="w-20" />
                      <span>{record.percentage}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Marks Summary Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Marks Summary</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Class Test</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Mid Semester</TableHead>
                <TableHead>End Semester</TableHead>
                <TableHead>Lab Internal Viva</TableHead>
                <TableHead>Lab External Viva</TableHead>
                <TableHead>Lab Record</TableHead>
                <TableHead>Lab Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marksSummary.map((course) => (
                <TableRow key={course.course_code}>
                  <TableCell>{course.course_code}</TableCell>
                  <TableCell>{course.course_name}</TableCell>
                  <TableCell>
                    {course.assessments['Class Test']?.marks || '-'}
                  </TableCell>
                  <TableCell>
                    {course.assessments['Assignment']?.marks || '-'}
                  </TableCell>
                  <TableCell>
                    {course.assessments['Mid Semester']?.marks || '-'}
                  </TableCell>
                  <TableCell>
                    {course.assessments['End Semester']?.marks || '-'}
                  </TableCell>
                  <TableCell>
                    {course.assessments['Lab Internal Viva']?.marks || '-'}
                  </TableCell>
                  <TableCell>
                    {course.assessments['Lab External Viva']?.marks || '-'}
                  </TableCell>
                  <TableCell>
                    {course.assessments['Lab Record']?.marks || '-'}
                  </TableCell>
                  <TableCell>
                    {course.assessments['Lab Performance']?.marks || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
} 