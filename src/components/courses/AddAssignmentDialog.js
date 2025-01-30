'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const assignmentSchema = z.object({
  course_id: z.number().positive(),
  faculty_id: z.number().positive(),
  section_id: z.number().positive(),
});

export default function AddAssignmentDialog({ children, onAssignmentAdded }) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      course_id: '',
      faculty_id: '',
      section_id: '',
    },
  });

  useEffect(() => {
    if (open) {
      fetchCourses();
      fetchFaculty();
      fetchSections();
    }
  }, [open]);

  async function fetchCourses() {
    try {
      const response = await fetch('/api/admin/dept/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  async function fetchFaculty() {
    try {
      const response = await fetch('/api/admin/dept/faculty');
      if (response.ok) {
        const data = await response.json();
        setFaculty(data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  }

  async function fetchSections() {
    try {
      const response = await fetch('/api/admin/dept/sections/all');
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  }

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/dept/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Course assignment created successfully',
        });
        form.reset();
        setOpen(false);
        onAssignmentAdded();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Course</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Course</label>
            <Select
              onValueChange={(value) => 
                form.setValue('course_id', parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem 
                    key={course.course_id} 
                    value={course.course_id.toString()}
                  >
                    {course.course_code} - {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.course_id && (
              <p className="text-sm text-red-500">
                {form.formState.errors.course_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Faculty</label>
            <Select
              onValueChange={(value) => 
                form.setValue('faculty_id', parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculty.map((member) => (
                  <SelectItem 
                    key={member.faculty_id} 
                    value={member.faculty_id.toString()}
                  >
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.faculty_id && (
              <p className="text-sm text-red-500">
                {form.formState.errors.faculty_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Section</label>
            <Select
              onValueChange={(value) => 
                form.setValue('section_id', parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem 
                    key={section.section_id} 
                    value={section.section_id.toString()}
                  >
                    {section.programme_name} - {section.batch_year} - {section.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.section_id && (
              <p className="text-sm text-red-500">
                {form.formState.errors.section_id.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign Course'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 