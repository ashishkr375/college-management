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
  section_name: z.string().min(1, 'Section name is required'),
  batch_id: z.string().min(1, 'Batch is required'),
});

export default function EditSectionDialog({ section = {}, children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [batches, setBatches] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      section_name: section?.section_name || '',
      batch_id: section?.batch_id?.toString() || '',
    },
  });

  useEffect(() => {
    if (open) {
      fetchBatches();
    }
  }, [open]);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (!response.ok) throw new Error('Failed to fetch batches');
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load batches',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`/api/sections/${section.section_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update section');
      }

      toast({
        title: 'Success',
        description: 'Section updated successfully',
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
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="section_name">Section Name</Label>
            <Input
              id="section_name"
              {...register('section_name')}
              placeholder="Enter section name"
            />
            {errors.section_name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.section_name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="batch_id">Batch</Label>
            <Select 
              onValueChange={(value) => setValue('batch_id', value)}
              defaultValue={section?.batch_id?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem 
                    key={batch.batch_id} 
                    value={batch.batch_id.toString()}
                  >
                    {batch.programme_name} - {batch.year} ({batch.dept_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.batch_id && (
              <p className="text-sm text-red-500 mt-1">
                {errors.batch_id.message}
              </p>
            )}
          </div>

          <Button type="submit">Update Section</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 