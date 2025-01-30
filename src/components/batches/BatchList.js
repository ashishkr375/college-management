'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import EditBatchDialog from './EditBatchDialog';
import DeleteBatchDialog from './DeleteBatchDialog';
import { formatDate } from '@/lib/utils';

export default function BatchList() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (!response.ok) throw new Error('Failed to fetch batches');
      const data = await response.json();
      setBatches(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading batches...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
        
            <TableHead>Programme</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No batches found
              </TableCell>
            </TableRow>
          ) : (
            batches.map((batch) => (
              <TableRow key={batch.batch_id}>
                
                <TableCell>{batch.programme_name}</TableCell>
                <TableCell>{batch.dept_name}</TableCell>
                <TableCell>{batch.year}</TableCell>
                <TableCell>{formatDate(batch.created_at)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <EditBatchDialog batch={batch}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </EditBatchDialog>
                  <DeleteBatchDialog batch={batch}>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </DeleteBatchDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 