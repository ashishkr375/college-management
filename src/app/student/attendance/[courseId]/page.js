'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function AttendanceView() {
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchAttendance();
    }
  }, [session, selectedMonth]);

  async function fetchAttendance() {
    try {
      const response = await fetch(
        `/api/student/attendance?courseId=${params.courseId}&month=${selectedMonth.getMonth() + 1}&year=${selectedMonth.getFullYear()}`
      );
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      setAttendance(data.attendance);
      setMonthlyStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getDateClassName = (date) => {
    const record = attendance.find(a => 
      new Date(a.date).toDateString() === date.toDateString()
    );
    if (!record) return "";

    const statusColors = {
      'Present': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
      'On Leave': 'bg-yellow-100 text-yellow-800'
    };

    return statusColors[record.status] || "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 col-span-2">
          <Calendar
            mode="single"
            selected={selectedMonth}
            onSelect={setSelectedMonth}
            className="rounded-md border"
            modifiersClassNames={{
              selected: 'bg-primary text-primary-foreground',
            }}
            modifiers={{
              customStyles: (date) => attendance.some(a => 
                new Date(a.date).toDateString() === date.toDateString()
              )
            }}
            styles={{
              day: (date) => getDateClassName(date)
            }}
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Statistics</h2>
          {monthlyStats && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{monthlyStats.percentage}%</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-xl font-semibold text-green-600">
                    {monthlyStats.present}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-xl font-semibold text-red-600">
                    {monthlyStats.absent}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leave</p>
                  <p className="text-xl font-semibold text-yellow-600">
                    {monthlyStats.leave}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 