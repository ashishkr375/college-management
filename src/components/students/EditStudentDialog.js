'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  roll_number: z.string().min(1, 'Roll number is required'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export default function EditStudentDialog({ student, children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roll_number: student?.roll_number || '',
      full_name: student?.full_name || '',
      email: student?.email || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`/api/students/${student.student_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roll_number: data.roll_number,
          full_name: data.full_name,
          email: data.email,
          section_id: student.section_id, // Keep the same section
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update student');
      }

      toast({
        title: 'Success',
        description: 'Student updated successfully',
      });
      setOpen(false);
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="roll_number">Roll Number</Label>
            <Input
              id="roll_number"
              {...register('roll_number')}
              placeholder="Enter roll number"
            />
            {errors.roll_number && (
              <p className="text-sm text-red-500 mt-1">{errors.roll_number.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="Enter full name"
            />
            {errors.full_name && (
              <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              {...register('email')}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit">Update Student</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 