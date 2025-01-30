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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const formSchema = z.object({
  roll_number: z.string().min(1, 'Roll number is required'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  section_id: z.string().min(1, 'Section is required'),
});

export default function AddStudentDialog({ children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roll_number: '',
      full_name: '',
      dept_id: '',
      programme_id: '',
      batch_id: '',
      section_id: '',
    },
  });

  const selectedDept = watch('dept_id');
  const selectedProg = watch('programme_id');
  const selectedBatch = watch('batch_id');
  const rollNumber = watch('roll_number');
  const fullName = watch('full_name');

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  useEffect(() => {
    if (selectedDept) {
      fetchProgrammes(selectedDept);
      setValue('programme_id', '');
      setValue('batch_id', '');
      setValue('section_id', '');
    }
  }, [selectedDept, setValue]);

  useEffect(() => {
    if (selectedProg) {
      fetchBatches(selectedProg);
      setValue('batch_id', '');
      setValue('section_id', '');
    }
  }, [selectedProg, setValue]);

  useEffect(() => {
    if (selectedBatch) {
      fetchSections(selectedBatch);
      setValue('section_id', '');
    }
  }, [selectedBatch, setValue]);

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

  const fetchProgrammes = async (deptId) => {
    try {
      const response = await fetch(`/api/programmes?dept_id=${deptId}`);
      if (!response.ok) throw new Error('Failed to fetch programmes');
      const data = await response.json();
      setProgrammes(data);
      setBatches([]);
      setSections([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load programmes',
        variant: 'destructive',
      });
    }
  };

  const fetchBatches = async (progId) => {
    try {
      const response = await fetch(`/api/batches?programme_id=${progId}`);
      if (!response.ok) throw new Error('Failed to fetch batches');
      const data = await response.json();
      setBatches(data);
      setSections([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load batches',
        variant: 'destructive',
      });
    }
  };

  const fetchSections = async (batchId) => {
    try {
      const response = await fetch(`/api/sections?batch_id=${batchId}`);
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sections',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roll_number: data.roll_number,
          full_name: data.full_name,
          email: data.email,
          section_id: data.section_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create student');
      }

      toast({
        title: 'Success',
        description: 'Student added successfully',
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
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Department</Label>
            <Select onValueChange={(value) => setValue('dept_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.dept_id} value={dept.dept_id.toString()}>
                    {dept.dept_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Programme</Label>
            <Select 
              onValueChange={(value) => setValue('programme_id', value)}
              disabled={!selectedDept}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Programme" />
              </SelectTrigger>
              <SelectContent>
                {programmes.map((prog) => (
                  <SelectItem key={prog.programme_id} value={prog.programme_id.toString()}>
                    {prog.programme_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Batch</Label>
            <Select 
              onValueChange={(value) => setValue('batch_id', value)}
              disabled={!selectedProg}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.batch_id} value={batch.batch_id.toString()}>
                    {batch.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Section</Label>
            <Select 
              onValueChange={(value) => setValue('section_id', value)}
              disabled={!selectedBatch}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.section_id} value={section.section_id.toString()}>
                    {section.section_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.section_id && (
              <p className="text-sm text-red-500 mt-1">{errors.section_id.message}</p>
            )}
          </div>

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

          <Button type="submit">Add Student</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 