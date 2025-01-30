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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  programme_name: z.string().min(2, 'Programme name must be at least 2 characters'),
  dept_id: z.string().min(1, 'Department is required'),
  level: z.enum(['UG', 'PG', 'Integrated']),
});

export default function EditProgrammeDialog({ programme = {}, children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [departments, setDepartments] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programme_name: programme?.programme_name || '',
      dept_id: programme?.dept_id?.toString() || '',
      level: programme?.level || '',
    },
  });

  // Fetch departments when dialog opens
  const handleDialogOpen = async (open) => {
    setOpen(open);
    if (open) {
      try {
        const response = await fetch('/api/departments');
        if (!response.ok) throw new Error('Failed to fetch departments');
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load departments',
          variant: 'destructive',
        });
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`/api/programmes/${programme.programme_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update programme');
      }

      toast({
        title: 'Success',
        description: 'Programme updated successfully',
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
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Programme</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="programme_name">Programme Name</Label>
            <Input
              id="programme_name"
              {...register('programme_name')}
              placeholder="Enter programme name"
            />
            {errors.programme_name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.programme_name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="dept_id">Department</Label>
            <Select
              onValueChange={(value) => setValue('dept_id', value)}
              defaultValue={programme?.dept_id?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.dept_id} value={dept.dept_id.toString()}>
                    {dept.dept_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dept_id && (
              <p className="text-sm text-red-500 mt-1">{errors.dept_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="level">Programme Level</Label>
            <Select
              onValueChange={(value) => setValue('level', value)}
              defaultValue={programme?.level}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UG">UG</SelectItem>
                <SelectItem value="PG">PG</SelectItem>
                <SelectItem value="Integrated">Integrated</SelectItem>
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-sm text-red-500 mt-1">
                {errors.level.message}
              </p>
            )}
          </div>

          <Button type="submit">Update Programme</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 