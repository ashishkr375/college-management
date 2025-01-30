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

export default function DeleteAssignmentDialog({ 
  children, 
  assignmentId, 
  courseName,
  sectionName,
  onAssignmentDeleted 
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/dept/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Course assignment deleted successfully',
        });
        setOpen(false);
        onAssignmentDeleted();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Course Assignment</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p>Are you sure you want to delete the assignment for:</p>
          <p className="font-medium mt-2">{courseName}</p>
          <p className="text-sm text-muted-foreground">Section: {sectionName}</p>
          <p className="text-sm text-red-500 mt-4">
            This will remove the faculty member's access to this course section.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 