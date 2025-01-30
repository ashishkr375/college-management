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
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  dept_id: z.string().min(1, 'Department is required'),
  is_dept_admin: z.boolean().default(false),
});

export default function AddFacultyDialog({ children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [departments, setDepartments] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      full_name: '',
      email: '',
      dept_id: '',
      is_dept_admin: false,
    },
  });

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const fetchDepartments = async () => {
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
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create faculty');
      }

      toast({
        title: 'Success',
        description: 'Faculty member created successfully',
      });
      setOpen(false);
      reset();
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
          <DialogTitle>Add New Faculty</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="employee_id">Employee ID</Label>
            <Input
              id="employee_id"
              {...register('employee_id')}
              placeholder="Enter employee ID"
            />
            {errors.employee_id && (
              <p className="text-sm text-red-500 mt-1">
                {errors.employee_id.message}
              </p>
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
              <p className="text-sm text-red-500 mt-1">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="dept_id">Department</Label>
            <Select onValueChange={(value) => setValue('dept_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem 
                    key={dept.dept_id} 
                    value={dept.dept_id.toString()}
                  >
                    {dept.dept_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dept_id && (
              <p className="text-sm text-red-500 mt-1">
                {errors.dept_id.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_dept_admin"
              onCheckedChange={(checked) => setValue('is_dept_admin', checked)}
            />
            <Label htmlFor="is_dept_admin">
              Make Department Admin
            </Label>
          </div>

          <Button type="submit">Create Faculty</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 