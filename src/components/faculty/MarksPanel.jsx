'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const ASSESSMENT_TYPES = {
  'Class Test': 20,
  'Mid Semester': 30,
  'End Semester': 70,
  'Assignment': 10,
  'Project': 50
};

export default function MarksPanel({ courseId, sectionId }) {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [assessmentType, setAssessmentType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId && sectionId) {
      fetchStudents();
    }
  }, [courseId, sectionId]);

  useEffect(() => {
    if (assessmentType) {
      fetchMarks();
    }
  }, [assessmentType]);

  async function fetchStudents() {
    try {
      const response = await fetch(`/api/faculty/sections/${sectionId}/students`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMarks() {
    try {
      const response = await fetch(
        `/api/faculty/marks?courseId=${courseId}&assessmentType=${assessmentType}`
      );
      if (!response.ok) throw new Error('Failed to fetch marks');
      const data = await response.json();
      
      // Convert array to object for easier access
      const marksMap = {};
      data.forEach(record => {
        marksMap[record.student_id] = record.score;
      });
      setMarks(marksMap);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      const marksData = Object.entries(marks).map(([studentId, score]) => ({
        studentId: parseInt(studentId),
        score: parseFloat(score),
        maxScore: ASSESSMENT_TYPES[assessmentType],
      }));

      const response = await fetch('/api/faculty/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          assessmentType,
          marks: marksData,
        }),
      });

      if (!response.ok) throw new Error('Failed to save marks');

      toast({
        title: 'Success',
        description: 'Marks saved successfully',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save marks',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={assessmentType}
          onValueChange={setAssessmentType}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Assessment" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ASSESSMENT_TYPES).map(([type, maxMarks]) => (
              <SelectItem key={type} value={type}>
                {type} (Max: {maxMarks})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {assessmentType && (
        <div className="border rounded-md p-4 space-y-4">
          {students.map((student) => (
            <div key={student.roll_number} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{student.full_name}</p>
                <p className="text-sm text-muted-foreground">{student.roll_number}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max={ASSESSMENT_TYPES[assessmentType]}
                  value={marks[student.roll_number] || ''}
                  onChange={(e) => {
                    const value = Math.min(
                      Math.max(0, parseFloat(e.target.value) || 0),
                      ASSESSMENT_TYPES[assessmentType]
                    );
                    setMarks(prev => ({
                      ...prev,
                      [student.roll_number]: value
                    }));
                  }}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  / {ASSESSMENT_TYPES[assessmentType]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {assessmentType && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
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
    </div>
  );
} 