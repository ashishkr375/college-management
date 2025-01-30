'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function DeleteDepartmentDialog({ department, children }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/departments/${department.dept_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete department');

      toast({
        title: 'Success',
        description: 'Department deleted successfully',
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
          <DialogTitle>Delete Department</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {department.dept_name}? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 