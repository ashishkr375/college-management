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

const formSchema = z.object({
  programme_id: z.string().min(1, 'Programme is required'),
  year: z.string()
    .regex(/^\d{4}$/, 'Must be a valid year')
    .transform(Number)
    .refine((val) => val >= 2000 && val <= 2100, 'Year must be between 2000 and 2100'),
});

export default function AddBatchDialog({ children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [programmes, setProgrammes] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      programme_id: '',
      year: new Date().getFullYear().toString(),
    },
  });

  useEffect(() => {
    if (open) {
      fetchProgrammes();
    }
  }, [open]);

  const fetchProgrammes = async () => {
    try {
      const response = await fetch('/api/programmes');
      if (!response.ok) throw new Error('Failed to fetch programmes');
      const data = await response.json();
      setProgrammes(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load programmes',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create batch');
      }

      toast({
        title: 'Success',
        description: 'Batch created successfully',
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
          <DialogTitle>Add New Batch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="programme_id">Programme</Label>
            <Select onValueChange={(value) => setValue('programme_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select programme" />
              </SelectTrigger>
              <SelectContent>
                {programmes.map((programme) => (
                  <SelectItem 
                    key={programme.programme_id} 
                    value={programme.programme_id.toString()}
                  >
                    {programme.programme_name} ({programme.dept_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.programme_id && (
              <p className="text-sm text-red-500 mt-1">
                {errors.programme_id.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="year">Batch Year</Label>
            <Input
              id="year"
              type="number"
              {...register('year')}
              min="2000"
              max="2100"
            />
            {errors.year && (
              <p className="text-sm text-red-500 mt-1">
                {errors.year.message}
              </p>
            )}
          </div>

          <Button type="submit">Create Batch</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 