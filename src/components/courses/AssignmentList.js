'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import DeleteAssignmentDialog from './DeleteAssignmentDialog';

export default function AssignmentList() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchAssignments();
    }
  }, [session]);

  async function fetchAssignments() {
    try {
      const response = await fetch('/api/admin/dept/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Faculty</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Programme</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No assignments found
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((assignment) => (
              <TableRow key={assignment.fc_id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{assignment.course_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.course_code}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{assignment.faculty_name}</TableCell>
                <TableCell>{assignment.section_name}</TableCell>
                <TableCell>{assignment.programme_name}</TableCell>
                <TableCell>{assignment.batch_year}</TableCell>
                <TableCell>
                  <DeleteAssignmentDialog
                    assignmentId={assignment.fc_id}
                    courseName={assignment.course_name}
                    sectionName={assignment.section_name}
                    onAssignmentDeleted={fetchAssignments}
                  >
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </DeleteAssignmentDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 