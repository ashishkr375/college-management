'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const assignmentSchema = z.object({
  courseId: z.string().min(1, 'Please select a course'),
  facultyId: z.string().min(1, 'Please select a faculty member'),
  sectionId: z.string().min(1, 'Please select a section'),
});

export default function AssignCourseForm({ 
  courses, 
  faculty, 
  sections, 
  onSubmit, 
  isSubmitting 
}) {
  const form = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      courseId: '',
      facultyId: '',
      sectionId: '',
    },
  });

  const handleSubmit = (data) => {
    // Convert string IDs to numbers before submitting
    onSubmit({
      courseId: parseInt(data.courseId),
      facultyId: parseInt(data.facultyId),
      sectionId: parseInt(data.sectionId),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Course</label>
        <Select
          onValueChange={(value) => form.setValue('courseId', value)}
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
        {form.formState.errors.courseId && (
          <p className="text-sm text-red-500">
            {form.formState.errors.courseId.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Faculty</label>
        <Select
          onValueChange={(value) => form.setValue('facultyId', value)}
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
        {form.formState.errors.facultyId && (
          <p className="text-sm text-red-500">
            {form.formState.errors.facultyId.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Section</label>
        <Select
          onValueChange={(value) => form.setValue('sectionId', value)}
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
        {form.formState.errors.sectionId && (
          <p className="text-sm text-red-500">
            {form.formState.errors.sectionId.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Assigning...' : 'Assign Course'}
      </Button>
    </form>
  );
} 