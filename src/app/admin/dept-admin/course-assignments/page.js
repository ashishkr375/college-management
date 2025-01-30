'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Breadcrumb } from '@/components/Breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import AssignCourseForm from '@/components/courses/AssignCourseForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CourseAssignmentPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/admin/dept-admin/dashboard' },
    { label: 'Course Assignments', href: '/admin/dept-admin/course-assignments' }
  ];

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  async function fetchData() {
    try {
      const [coursesRes, facultyRes, sectionsRes, assignmentsRes] = await Promise.all([
        fetch('/api/admin/dept/courses'),
        fetch('/api/admin/dept/faculty'),
        fetch('/api/admin/dept/sections/all'),
        fetch('/api/admin/dept/assignments')
      ]);

      if (!assignmentsRes.ok) throw new Error('Failed to fetch assignments');
      if (!coursesRes.ok) throw new Error('Failed to fetch courses');
      if (!facultyRes.ok) throw new Error('Failed to fetch faculty');
      if (!sectionsRes.ok) throw new Error('Failed to fetch sections');

      const [coursesData, facultyData, sectionsData, assignmentsData] = await Promise.all([
        coursesRes.json(),
        facultyRes.json(),
        sectionsRes.json(),
        assignmentsRes.json()
      ]);

      setCourses(coursesData);
      setFaculty(facultyData);
      setSections(sectionsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAssignCourse(data) {
    try {
      console.log('Submitting data:', data); // For debugging
      const response = await fetch('/api/admin/dept/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: data.courseId,
          facultyId: data.facultyId,
          sectionId: data.sectionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign course');
      }

      toast({
        title: 'Success',
        description: 'Course assigned successfully',
      });
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Assignment error:', error); // For debugging
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  async function handleDeleteAssignment() {
    if (!deleteId) return;
    
    try {
      setDeleteLoading(true);
      console.log('Deleting assignment:', deleteId); // Add this for debugging
      const response = await fetch(`/api/admin/dept/assignments/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete assignment');
      }

      toast({
        title: 'Success',
        description: 'Course assignment removed successfully',
      });
      
      setShowDeleteAlert(false);
      await fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Assignments</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Assign Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Course to Faculty</DialogTitle>
            </DialogHeader>
            <AssignCourseForm
              courses={courses}
              faculty={faculty}
              sections={sections}
              onSubmit={handleAssignCourse}
              isSubmitting={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.faculty_course_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{assignment.course_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.course_code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{assignment.faculty_name}</TableCell>
                  <TableCell>{assignment.section_name}</TableCell>
                  <TableCell>{assignment.programme_name}</TableCell>
                  <TableCell>{assignment.batch_year}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDeleteId(assignment.faculty_course_id);
                        setShowDeleteAlert(true);
                      }}
                      disabled={deleteLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this course assignment. Faculty member will no longer have access to this course section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssignment}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                'Delete Assignment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 