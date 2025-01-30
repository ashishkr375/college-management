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
  file: z.any().refine((file) => file?.length === 1, 'CSV file is required'),
});

export default function ImportFacultyDialog({ children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [importing, setImporting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dept_id: '',
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

  const downloadTemplate = () => {
    const headers = ['employee_id', 'full_name', 'email', 'is_dept_admin'];
    const csvContent = headers.join(',') + '\n' + 
      'EMP001,John Doe,john.doe@itp.ac.in,0\n' +  // Example row
      'EMP002,Jane Smith,jane.smith@itp.ac.in,1';  // Example row with dept admin
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faculty-import-template.csv';
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
      formData.append('dept_id', data.dept_id);

      const response = await fetch('/api/faculty/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import faculty');
      }

      toast({
        title: 'Success',
        description: `Successfully imported ${result.imported} faculty members. ${result.errors?.length ? `${result.errors.length} errors found.` : ''}`,
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
          <DialogTitle>Import Faculty</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Download the template and add faculty details in the CSV format.
              Required columns: employee_id, full_name, email, is_dept_admin (0 or 1)
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
              {errors.dept_id && (
                <p className="text-sm text-red-500 mt-1">{errors.dept_id.message}</p>
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
              {importing ? 'Importing...' : 'Import Faculty'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}