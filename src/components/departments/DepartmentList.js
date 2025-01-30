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
import EditDepartmentDialog from './EditDepartmentDialog';
import DeleteDepartmentDialog from './DeleteDepartmentDialog';
import { formatDate } from '@/lib/utils';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      setDepartments(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading departments...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department Name</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Programs</TableHead>
            <TableHead>Faculty Count</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No departments found
              </TableCell>
            </TableRow>
          ) : (
            departments.map((department) => (
              <TableRow key={department.dept_id}>
                <TableCell className="font-medium">
                  {department.dept_name}
                </TableCell>
                <TableCell>{formatDate(department.created_at)}</TableCell>
                <TableCell>{department.program_count || 0}</TableCell>
                <TableCell>{department.faculty_count || 0}</TableCell>
                <TableCell className="text-right space-x-2">
                  <EditDepartmentDialog department={department}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </EditDepartmentDialog>
                  <DeleteDepartmentDialog department={department}>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </DeleteDepartmentDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 