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
import { useToast } from '@/components/ui/use-toast';

export default function DeleteProgrammeDialog({ programme, children }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/programmes/${programme.programme_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete programme');
      }

      toast({
        title: 'Success',
        description: 'Programme deleted successfully',
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
          <DialogTitle>Delete Programme</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {programme.programme_name}? This action cannot be undone.
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