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
import EditStudentDialog from './EditStudentDialog';
import DeleteStudentDialog from './DeleteStudentDialog';
import { formatDate } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  
  // Filters
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedProg, setSelectedProg] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      fetchProgrammes(selectedDept);
      setSelectedProg('');
      setSelectedBatch('');
      setSelectedSection('');
    }
  }, [selectedDept]);

  useEffect(() => {
    if (selectedProg) {
      fetchBatches(selectedProg);
      setSelectedBatch('');
      setSelectedSection('');
    }
  }, [selectedProg]);

  useEffect(() => {
    if (selectedBatch) {
      fetchSections(selectedBatch);
      setSelectedSection('');
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedSection) {
      fetchStudents(selectedSection);
    }
  }, [selectedSection]);

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

  const fetchProgrammes = async (deptId) => {
    try {
      const response = await fetch(`/api/programmes?dept_id=${deptId}`);
      if (!response.ok) throw new Error('Failed to fetch programmes');
      const data = await response.json();
      setProgrammes(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchBatches = async (progId) => {
    try {
      const response = await fetch(`/api/batches?programme_id=${progId}`);
      if (!response.ok) throw new Error('Failed to fetch batches');
      const data = await response.json();
      setBatches(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSections = async (batchId) => {
    try {
      const response = await fetch(`/api/sections?batch_id=${batchId}`);
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchStudents = async (sectionId) => {
    try {
      const response = await fetch(`/api/students?section_id=${sectionId}`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label>Department</Label>
          <Select onValueChange={setSelectedDept} value={selectedDept}>
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.dept_id} value={dept.dept_id.toString()}>
                  {dept.dept_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Programme</Label>
          <Select onValueChange={setSelectedProg} value={selectedProg} disabled={!selectedDept}>
            <SelectTrigger>
              <SelectValue placeholder="Select Programme" />
            </SelectTrigger>
            <SelectContent>
              {programmes.map((prog) => (
                <SelectItem key={prog.programme_id} value={prog.programme_id.toString()}>
                  {prog.programme_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Batch</Label>
          <Select onValueChange={setSelectedBatch} value={selectedBatch} disabled={!selectedProg}>
            <SelectTrigger>
              <SelectValue placeholder="Select Batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.batch_id} value={batch.batch_id.toString()}>
                  {batch.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Section</Label>
          <Select onValueChange={setSelectedSection} value={selectedSection} disabled={!selectedBatch}>
            <SelectTrigger>
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.section_id} value={section.section_id.toString()}>
                  {section.section_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedSection && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell>{student.roll_number}</TableCell>
                    <TableCell className="font-medium">
                      {student.full_name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{formatDate(student.created_at)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <EditStudentDialog student={student}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </EditStudentDialog>
                      <DeleteStudentDialog student={student}>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DeleteStudentDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 