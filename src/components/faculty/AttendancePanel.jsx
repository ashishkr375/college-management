'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function AttendancePanel({ courseCode, sectionId }) {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (courseCode && sectionId) {
      fetchStudents();
      fetchAttendance();
    }
  }, [courseCode, sectionId, date]);

  async function fetchStudents() {
    try {
      const response = await fetch(`/api/faculty/sections/${sectionId}/students`);
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data);
      
      // Initialize attendance state for all students
      const initialAttendance = {};
      data.forEach(student => {
        initialAttendance[student.roll_number] = attendance[student.roll_number] || 'Absent';
      });
      setAttendance(initialAttendance);
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

  async function fetchAttendance() {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(
        `/api/faculty/attendance?courseCode=${courseCode}&date=${formattedDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      
      // Convert array to object for easier access
      const attendanceMap = {};
      data.forEach(record => {
        attendanceMap[record.roll_number] = record.status;
      });
      setAttendance(prev => ({ ...prev, ...attendanceMap }));
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const attendanceData = Object.entries(attendance).map(([roll_number, status]) => ({
        roll_number,
        status,
        course_code: courseCode,
        date: formattedDate,
      }));

      const response = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: attendanceData }),
      });

      if (!response.ok) throw new Error('Failed to save attendance');

      toast({
        title: 'Success',
        description: 'Attendance saved successfully',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save attendance',
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
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        
        <div className="flex-[2] border rounded-md p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {students.map((student) => (
            <div key={student.roll_number} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{student.full_name}</p>
                <p className="text-sm text-muted-foreground">{student.roll_number}</p>
              </div>
              
              <RadioGroup
                value={attendance[student.roll_number]}
                onValueChange={(value) =>
                  setAttendance(prev => ({
                    ...prev,
                    [student.roll_number]: value
                  }))
                }
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Present" id={`present-${student.roll_number}`} />
                  <Label htmlFor={`present-${student.roll_number}`}>Present</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Absent" id={`absent-${student.roll_number}`} />
                  <Label htmlFor={`absent-${student.roll_number}`}>Absent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="On Leave" id={`leave-${student.roll_number}`} />
                  <Label htmlFor={`leave-${student.roll_number}`}>On Leave</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Attendance'
          )}
        </Button>
      </div>
    </div>
  );
} 