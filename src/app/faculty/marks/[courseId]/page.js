'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { FacultyNavigation } from '@/components/faculty-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function MarksPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState('Class Test');
  const [isEditing, setIsEditing] = useState(false);
  const [previousAssessments, setPreviousAssessments] = useState([]);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const assessmentTypes = [
    'Class Test',
    'Assignment',
    'Mid Semester',
    'End Semester',
    'Lab Internal Viva',
    'Lab External Viva',
    'Lab Record',
    'LabPerformance'
  ];

  useEffect(() => {
    if (session?.user?.id) {
      fetchStudents();
      fetchPreviousAssessments();
    }
  }, [session]);

  useEffect(() => {
    if (selectedAssessment) {
      fetchMarks();
    }
  }, [selectedAssessment]);

  async function fetchStudents() {
    try {
      const response = await fetch(`/api/faculty/students?courseId=${params.courseId}`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchPreviousAssessments() {
    try {
      const response = await fetch(`/api/faculty/marks/assessments?courseId=${params.courseId}`);
      if (!response.ok) throw new Error('Failed to fetch previous assessments');
      const data = await response.json();
      
      // Group assessments by type with dates
      const groupedAssessments = data.reduce((acc, record) => {
        if (!acc[record.assessment_type]) {
          acc[record.assessment_type] = [];
        }
        acc[record.assessment_type].push({
          date: new Date(record.created_at),
          count: record.student_count,
          average: record.average_marks
        });
        return acc;
      }, {});
      
      setAssessmentHistory(groupedAssessments);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load previous assessments",
        variant: "destructive",
      });
    }
  }

  async function fetchMarks() {
    try {
      const response = await fetch(
        `/api/faculty/marks?courseId=${params.courseId}&assessmentType=${selectedAssessment}`
      );
      if (!response.ok) throw new Error('Failed to fetch marks');
      const data = await response.json();
      
      // Create a map of student marks
      const marksMap = {};
      data.forEach(record => {
        marksMap[record.roll_number] = record.marks;
      });
      setMarks(marksMap);
    } catch (error) {
      console.error('Error fetching marks:', error);
      toast({
        title: "Error",
        description: "Failed to load marks",
        variant: "destructive",
      });
    }
  }

  const handleMarkChange = (roll_number, value) => {
    // Validate mark value
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return;

    setMarks(prev => ({
      ...prev,
      [roll_number]: value
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Only include students with marks
      const marksData = Object.entries(marks)
        .filter(([_, mark]) => mark && mark.toString().trim() !== '')
        .map(([roll_number, mark]) => ({
          roll_number,
          marks: parseFloat(mark),
          assessment_type: selectedAssessment
        }));

      if (marksData.length === 0) {
        toast({
          title: "Error",
          description: "Please enter marks for at least one student",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/faculty/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: params.courseId,
          marks: marksData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save marks');
      }

      toast({
        title: "Success",
        description: "Marks saved successfully",
      });

      // Refresh the marks and assessments
      await fetchPreviousAssessments();
      await fetchMarks();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving marks:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save marks",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Function to load specific assessment record
  async function loadAssessmentRecord(type, date) {
    try {
      const response = await fetch(
        `/api/faculty/marks/record?courseId=${params.courseId}&assessmentType=${type}&date=${date.toISOString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch assessment record');
      const data = await response.json();
      
      setMarks(data.marks);
      setSelectedRecord({ type, date });
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment record",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Marks Management</h1>
          
          <div className="flex items-center gap-4">
            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessmentTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {Object.keys(marks).length > 0 && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Edit Marks
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="text-left p-4">Roll Number</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Marks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.roll_number} className="border-b">
                    <td className="p-4">{student.roll_number}</td>
                    <td className="p-4">{student.full_name}</td>
                    <td className="p-4">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={marks[student.roll_number] || ''}
                        onChange={(e) => handleMarkChange(student.roll_number, e.target.value)}
                        className="w-24"
                        disabled={!isEditing && Object.keys(marks).length > 0}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(isEditing || Object.keys(marks).length === 0) && (
            <div className="mt-6 flex justify-end gap-4">
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    fetchMarks();
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Marks'
                )}
              </Button>
            </div>
          )}
        </form>

        {/* Previous Assessments Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Previous Assessments</h2>
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(assessmentHistory).map(([type, records]) => (
              <div key={type} className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">{type}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {records.map((record, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={
                        selectedRecord?.type === type && 
                        selectedRecord?.date.getTime() === record.date.getTime() 
                          ? 'border-primary' 
                          : ''
                      }
                      onClick={() => loadAssessmentRecord(type, record.date)}
                    >
                      <div className="text-left">
                        <div>{record.date.toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Students: {record.count}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg: {record.average.toFixed(2)}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Assessment View */}
        {selectedRecord && (
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {selectedRecord.type} - {selectedRecord.date.toLocaleDateString()}
              </h3>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Marks
                </Button>
              )}
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="text-left p-4">Roll Number</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.roll_number} className="border-b">
                      <td className="p-4">{student.roll_number}</td>
                      <td className="p-4">{student.full_name}</td>
                      <td className="p-4">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={marks[student.roll_number] || ''}
                          onChange={(e) => handleMarkChange(student.roll_number, e.target.value)}
                          className="w-24"
                          disabled={!isEditing && Object.keys(marks).length > 0}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
 