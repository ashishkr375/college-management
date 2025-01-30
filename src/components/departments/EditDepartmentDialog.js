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
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  dept_name: z.string().min(2, 'Department name must be at least 2 characters'),
});

export default function EditDepartmentDialog({ department, children }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dept_name: department.dept_name,
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`/api/departments/${department.dept_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update department');

      toast({
        title: 'Success',
        description: 'Department updated successfully',
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
          <DialogTitle>Edit Department</DialogTitle>
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
          <Button type="submit">Update Department</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 