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
import EditSectionDialog from './EditSectionDialog';
import DeleteSectionDialog from './DeleteSectionDialog';
import { formatDate } from '@/lib/utils';

export default function SectionList() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections');
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading sections...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Section Name</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Programme</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No sections found
              </TableCell>
            </TableRow>
          ) : (
            sections.map((section) => (
              <TableRow key={section.section_id}>
                <TableCell className="font-medium">
                  {section.section_name}
                </TableCell>
                <TableCell>{section.batch_year}</TableCell>
                <TableCell>{section.programme_name}</TableCell>
                <TableCell>{section.dept_name}</TableCell>
                <TableCell>{formatDate(section.created_at)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <EditSectionDialog section={section}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </EditSectionDialog>
                  <DeleteSectionDialog section={section}>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </DeleteSectionDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 