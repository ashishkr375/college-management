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

export default function DeleteBatchDialog({ batch, children }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/batches/${batch.batch_id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.hasReferences) {
          setError(data.error);
          throw new Error(data.error);
        } else {
          throw new Error(data.error || 'Failed to delete batch');
        }
      }

      toast({
        title: 'Success',
        description: data.message || 'Batch deleted successfully',
      });
      
      setOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) setError('');
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Batch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete batch from {batch.year}? This action cannot be undone.
          </p>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}
        </div>
        <DialogFooter className="gap-2">
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