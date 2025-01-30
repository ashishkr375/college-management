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
import EditFacultyDialog from './EditFacultyDialog';
import DeleteFacultyDialog from './DeleteFacultyDialog';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function FacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await fetch('/api/faculty');
      if (!response.ok) throw new Error('Failed to fetch faculty');
      const data = await response.json();
      setFaculty(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading faculty...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faculty.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No faculty found
              </TableCell>
            </TableRow>
          ) : (
            faculty.map((member) => (
              <TableRow key={member.faculty_id}>
                <TableCell>{member.employee_id}</TableCell>
                <TableCell className="font-medium">
                  {member.full_name}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.dept_name}</TableCell>
                <TableCell>
                  {member.is_dept_admin && (
                    <Badge variant="secondary">Department Admin</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(member.created_at)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <EditFacultyDialog faculty={member}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </EditFacultyDialog>
                  <DeleteFacultyDialog faculty={member}>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </DeleteFacultyDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 