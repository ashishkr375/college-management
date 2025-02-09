'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Users, ClipboardList, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { signOut } from "next-auth/react";
export default function FacultyDashboard() {
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
      const response = await fetch('/api/faculty/assignments');
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="inline-flex w-auto rounded-md bg-rose-600 justify-end items-end text-white px-4 py-2 font-bold hover:bg-rose-700">
        <button onClick={() => signOut()} className="hover:bg-rose-700">
          Log Out
        </button>
      </div>
      <h1 className="text-3xl font-bold">My Courses</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {assignments.map((assignment) => (
          <Card key={assignment.faculty_course_id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{assignment.course_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {assignment.course_code} • {assignment.section_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {assignment.programme_name} ({assignment.batch_year})
                </p>
              </div>

              <div className="flex gap-4">
                <Link 
                  href={`/faculty/attendance/${assignment.faculty_course_id}`}
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                >
                  <Users className="h-5 w-5" />
                  <span>Attendance</span>
                </Link>

                <Link 
                  href={`/faculty/marks/${assignment.faculty_course_id}`}
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>Marks</span>
                </Link>

                <Link 
                  href={`/faculty/materials/${assignment.faculty_course_id}`}
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Materials</span>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 