'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FacultyNavigation } from '@/components/faculty-navigation';

export default function AttendancePage() {
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [mode, setMode] = useState('daily');
  const [date, setDate] = useState(new Date());
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const STUDENTS_PER_PAGE = 20;
  const totalPages = Math.ceil(students.length / STUDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = startIndex + STUDENTS_PER_PAGE;
  const currentStudents = students.slice(startIndex, endIndex);

  useEffect(() => {
    if (session?.user) {
      fetchStudents();
    }
  }, [session]);

  useEffect(() => {
    if (date && mode === 'daily') {
      fetchAttendance();
    }
  }, [date]);

  useEffect(() => {
    if (session?.user) {
      fetchAttendanceDates();
    }
  }, [session]);

  async function fetchStudents() {
    try {
      const apiUrl = `/api/faculty/students?courseId=${params.courseId}`;
      console.log('Fetching students from:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      
      const text = await response.text();
      console.log('Raw response:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Invalid response format');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students');
      }
      
      setStudents(data);
      
      // Initialize attendance
      const initialAttendance = {};
      data.forEach(student => {
        initialAttendance[student.roll_number] = '1';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAttendance() {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log('Fetching attendance for date:', formattedDate);
      
      const response = await fetch(
        `/api/faculty/attendance?faculty_course_id=${params.courseId}&date=${formattedDate}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch attendance');
      }
      
      const data = await response.json();
      console.log('Fetched attendance:', data);
      
      if (data.length > 0) {
        // Update attendance state with fetched data
        const attendanceMap = {};
        data.forEach(record => {
            attendanceMap[record.roll_number] = String(record.status);
        });
        setAttendance(attendanceMap);
        setSelectedDate(formattedDate);
        setIsEditing(false);
      } else if (selectedDate === formattedDate) {
        // If no attendance found for selected date, reset to default
        const initialAttendance = {};
        students.forEach(student => {
          initialAttendance[student.roll_number] = '1';
        });
        setAttendance(initialAttendance);
        setSelectedDate(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load attendance',
        variant: 'destructive',
      });
    }
  }

  async function fetchAttendanceDates() {
    try {
      const response = await fetch(`/api/faculty/attendance/dates?faculty_course_id=${params.courseId}`);
      if (!response.ok) throw new Error('Failed to fetch attendance dates');
      const data = await response.json();
      setAttendanceDates(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance dates',
        variant: 'destructive',
      });
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Create attendance data array
      const attendanceData = Object.entries(attendance).map(([roll_number, status]) => ({
        roll_number,
       status
      }));

      const response = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_course_id: params.courseId,
          attendance: attendanceData,
          start_date:new Date().toISOString().split('T')[0],
          end_date:new Date().toISOString().split('T')[0],
          total_classes:1,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save attendance');
      }

      toast({
        title: 'Success',
        description: 'Attendance saved successfully',
      });

      // Refresh the attendance dates list
      await fetchAttendanceDates();
      
      // Set the current date as selected date
      setSelectedDate(formattedDate);
      setIsEditing(false);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save attendance',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleDateSelect = (newDate) => {
    if (newDate) {
      if (newDate > new Date()) {
        toast({
          title: "Invalid Date",
          description: "Cannot select future dates",
          variant: "destructive",
        });
        return;
      }
      
      setDate(newDate);
      setSelectedDate(null);
      setIsEditing(false);
      const initialAttendance = {};
      students.forEach(student => {
        initialAttendance[student.roll_number] = '1';
      });
      setAttendance(initialAttendance);
      setIsDateDialogOpen(false);
    }
  };

  const CustomCalendar = () => (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDateDialogOpen(false)}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) => date > new Date()}
          className="rounded-md border shadow"
          classNames={{
            head_cell: "text-muted-foreground font-normal text-sm",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            caption: "text-sm font-medium",
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
        />
      </div>
    </div>
  );

  async function handleCSVUpload() {
    try {
      setIsUploading(true);
      if (!csvFile) {
        toast({
          title: "Error",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const rows = text.split('\n').map(row => row.trim());
          
          // Skip header row and filter out empty rows
          const data = rows.slice(1)
            .filter(row => row.length > 0)
            .map(row => {
              const [roll_number, dateStr, status] = row.split(',').map(cell => cell.trim());
              
              // Parse and format the date to YYYY-MM-DD
              const dateParts = dateStr.split(/[-/]/);
              let formattedDate;
              
              // Handle different date formats
              if (dateParts.length === 3) {
                // Assume the date could be in DD-MM-YYYY or YYYY-MM-DD format
                const year = dateParts[2].length === 4 ? dateParts[2] : dateParts[0];
                const month = String(parseInt(dateParts[1])).padStart(2, '0');
                const day = String(parseInt(dateParts[0])).padStart(2, '0');
                formattedDate = `${year}-${month}-${day}`;
              } else {
                throw new Error(`Invalid date format in row: ${row}`);
              }

              return { 
                roll_number, 
                date: formattedDate, 
                status 
              };
            });

          // Validate data
          const validStatuses = ['Present', 'Absent', 'On Leave'];
          const isValid = data.every(row => 
            row.roll_number && 
            row.date && 
            validStatuses.includes(row.status)
          );

          if (!isValid) {
            throw new Error('Invalid CSV format. Please check the sample format.');
          }

          // Group attendance by date
          const attendanceByDate = data.reduce((acc, row) => {
            if (!acc[row.date]) {
              acc[row.date] = [];
            }
            acc[row.date].push({
              roll_number: row.roll_number,
              status: row.status
            });
            return acc;
          }, {});

          // Save attendance for each date
          for (const [date, attendance] of Object.entries(attendanceByDate)) {
            const response = await fetch('/api/faculty/attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseId: params.courseId,
                attendance,
                date
              }),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || `Failed to save attendance for ${date}`);
            }
          }

          toast({
            title: "Success",
            description: "Attendance records uploaded successfully",
          });
          window.location.reload();
          // Reset file input and refresh dates
          setCsvFile(null);
          await fetchAttendanceDates();

        } catch (error) {
          console.error('CSV Processing Error:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to process CSV file",
            variant: "destructive",
          });
        }
      };

      reader.readAsText(csvFile);

    } catch (error) {
      console.error('Upload Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload attendance",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
      <FacultyNavigation />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Attendance</h1>
          
          <div className="flex gap-4">
            <Button 
              variant={mode === 'daily' ? 'default' : 'outline'}
              onClick={() => setMode('daily')}
            >
              Daily
            </Button>
            <Button 
              variant={mode === 'monthly' ? 'default' : 'outline'}
              onClick={() => setMode('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>

        {mode === 'daily' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="min-w-[140px]">
                      {format(date, 'dd MMMM yyyy')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] p-0">
                    <CustomCalendar />
                  </DialogContent>
                </Dialog>
              </div>
              
              {selectedDate && !isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Attendance
                </Button>
              ) : null}
            </div>

            <div className="border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left">Roll Number</th>
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student) => (
                    <tr key={student.roll_number} className="border-b">
                      <td className="p-4">{student.roll_number}</td>
                      <td className="p-4">{student.full_name}</td>
                      <td className="p-4">
                        <RadioGroup
                          name={`attendance-${student.roll_number}`}
                          value={attendance[student.roll_number]}
                          onValueChange={(value) =>
                            !selectedDate || isEditing ? 
                              setAttendance(prev => ({
                                ...prev,
                                [student.roll_number]: value
                              })) : null
                          }
                          className="flex gap-4"
                          disabled={selectedDate && !isEditing}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="1" 
                              id={`present-${student.roll_number}`} 
                            />
                            <Label htmlFor={`present-${student.roll_number}`}>Present</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="-1" 
                              id={`absent-${student.roll_number}`} 
                            />
                            <Label htmlFor={`absent-${student.roll_number}`}>Absent</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="0" 
                              id={`leave-${student.roll_number}`} 
                            />
                            <Label htmlFor={`leave-${student.roll_number}`}>On Leave</Label>
                          </div>
                        </RadioGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {students.length > STUDENTS_PER_PAGE && (
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            

            {(!selectedDate || isEditing) && (
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
            )}

<div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Previous Attendance Records</h2>
              <div className="grid grid-cols-4 gap-4">
              {attendanceDates.map((record, index) => (
                <Button
                  key={`${record.start_date}-${index}`}
                  variant="outline"
                  className={selectedDate === record.start_date ? 'border-primary' : ''}
                  onClick={() => {
                    setDate(new Date(record.start_date));
                    setSelectedDate(record.start_date);
                    setIsEditing(false);
                  }}
                >
                  {new Date(record.start_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Button>
              ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <Label>Upload CSV File</Label>
                <Button variant="outline" onClick={downloadSampleCSV}>
                  Download Sample CSV
                </Button>
              </div>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                disabled={isUploading}
              />
              <p className="text-sm text-muted-foreground">
                CSV Format: roll_number,date,status (Present/Absent/On Leave)
              </p>
            </div>
            <Button 
              disabled={!csvFile || isUploading} 
              onClick={handleCSVUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function downloadSampleCSV() {
  // Generate dates for the last week
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Format date as YYYY-MM-DD
    return format(date, 'yyyy-MM-dd');
  });

  // Sample roll numbers
  const rollNumbers = Array.from({ length: 5 }, (_, i) => 
    `2247${String(i + 1).padStart(3, '0')}`
  );

  // Generate sample data with header
  const sampleData = [
    ['roll_number', 'date (YYYY-MM-DD)', 'status']
  ];

  // Add sample records
  dates.forEach(date => {
    rollNumbers.forEach(roll => {
      const status = Math.random() > 0.2 ? 'Present' : 
                    Math.random() > 0.5 ? 'Absent' : 'On Leave';
      sampleData.push([roll, date, status]);
    });
  });

  const csvContent = sampleData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'attendance_sample.csv';
  a.click();
  window.URL.revokeObjectURL(url);
} 