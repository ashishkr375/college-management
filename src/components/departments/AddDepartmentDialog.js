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
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  dept_name: z.string().min(2, 'Department name must be at least 2 characters'),
});

export default function AddDepartmentDialog({ children }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(formSchema),
  });
  const { toast } = useToast()

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create department');

      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
      setOpen(false);
      reset();
      // Refresh the departments list
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
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="dept_name">Department Name</Label>
            <Input
              id="dept_name"
              {...register('dept_name')}
              placeholder="Enter department name"
            />
            {errors.dept_name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.dept_name.message}
              </p>
            )}
          </div>
          <Button type="submit">Create Department</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 