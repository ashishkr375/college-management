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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const courseSchema = z.object({
  course_code: z.string().min(2).max(20),
  course_name: z.string().min(2).max(100),
  credits: z.number().min(1).max(6),
  programme_id: z.number().positive(),
});

export default function EditCourseDialog({ children, course, onCourseUpdated }) {
  const [open, setOpen] = useState(false);
  const [programmes, setProgrammes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_code: course.course_code,
      course_name: course.course_name,
      credits: course.credits,
      programme_id: course.programme_id,
    },
  });

  useEffect(() => {
    fetchProgrammes();
  }, []);

  async function fetchProgrammes() {
    try {
      const response = await fetch('/api/admin/dept/programmes');
      if (response.ok) {
        const data = await response.json();
        setProgrammes(data);
      }
    } catch (error) {
      console.error('Error fetching programmes:', error);
    }
  }

  async function onSubmit(data) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/dept/courses/${course.course_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Course updated successfully',
        });
        setOpen(false);
        onCourseUpdated();
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
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Course Code</label>
            <Input
              {...form.register('course_code')}
              placeholder="e.g., CS101"
            />
            {form.formState.errors.course_code && (
              <p className="text-sm text-red-500">
                {form.formState.errors.course_code.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Course Name</label>
            <Input
              {...form.register('course_name')}
              placeholder="Introduction to Programming"
            />
            {form.formState.errors.course_name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.course_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Credits</label>
            <Input
              type="number"
              {...form.register('credits', { valueAsNumber: true })}
              min={1}
              max={6}
            />
            {form.formState.errors.credits && (
              <p className="text-sm text-red-500">
                {form.formState.errors.credits.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Programme</label>
            <Select
              defaultValue={course.programme_id.toString()}
              onValueChange={(value) => 
                form.setValue('programme_id', parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Programme" />
              </SelectTrigger>
              <SelectContent>
                {programmes.map((programme) => (
                  <SelectItem 
                    key={programme.programme_id} 
                    value={programme.programme_id.toString()}
                  >
                    {programme.programme_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.programme_id && (
              <p className="text-sm text-red-500">
                {form.formState.errors.programme_id.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Course'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 