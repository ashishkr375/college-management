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
import EditProgrammeDialog from './EditProgrammeDialog';
import DeleteProgrammeDialog from './DeleteProgrammeDialog';
import { formatDate } from '@/lib/utils';

export default function ProgrammeList() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const response = await fetch('/api/programmes');
      if (!response.ok) throw new Error('Failed to fetch programmes');
      const data = await response.json();
      setProgrammes(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading programmes...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Programme Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programmes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No programmes found
              </TableCell>
            </TableRow>
          ) : (
            programmes.map((programme) => (
              <TableRow key={programme.programme_id}>
                <TableCell className="font-medium">
                  {programme.programme_name}
                </TableCell>
                <TableCell>{programme.dept_name}</TableCell>
                <TableCell>{programme.level}</TableCell>
                <TableCell>{formatDate(programme.created_at)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <EditProgrammeDialog programme={programme}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </EditProgrammeDialog>
                  <DeleteProgrammeDialog programme={programme}>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </DeleteProgrammeDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 