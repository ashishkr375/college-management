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
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Download } from 'lucide-react';

const formSchema = z.object({
  dept_id: z.string().min(1, 'Department is required'),
  programme_id: z.string().min(1, 'Programme is required'),
  batch_id: z.string().min(1, 'Batch is required'),
  section_id: z.string().min(1, 'Section is required'),
  file: z.any().refine((file) => file?.length === 1, 'CSV file is required'),
});

export default function ImportStudentsDialog({ children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [importing, setImporting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dept_id: '',
      programme_id: '',
      batch_id: '',
      section_id: '',
    },
  });

  const selectedDept = watch('dept_id');
  const selectedProg = watch('programme_id');
  const selectedBatch = watch('batch_id');

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

  const downloadTemplate = () => {
    const headers = ['roll_number', 'full_name', 'email'];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const onSubmit = async (data) => {
    try {
      setImporting(true);
      const file = data.file[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section_id', data.section_id);

      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import students');
      }

      toast({
        title: 'Success',
        description: `Successfully imported ${result.imported} students. ${result.errors?.length ? `${result.errors.length} errors found.` : ''}`,
      });

      if (result.errors?.length) {
        // Download error report
        const errorCSV = 'Row,Error\n' + result.errors.map(e => `${e.row},"${e.error}"`).join('\n');
        const blob = new Blob([errorCSV], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'import-errors.csv';
        a.click();
      }

      setOpen(false);
      reset();
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Download the template and add student details in the CSV format.
              Required columns: roll_number, full_name, email
            </AlertDescription>
          </Alert>

          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>

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
              <Label htmlFor="file">CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                {...register('file')}
              />
              {errors.file && (
                <p className="text-sm text-red-500 mt-1">{errors.file.message}</p>
              )}
            </div>

            <Button type="submit" disabled={importing} className="w-full">
              {importing ? 'Importing...' : 'Import Students'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 