'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function FacultyCoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFacultyCourses();
    }
  }, [session]);

  async function fetchFacultyCourses() {
    try {
      const response = await fetch(`/api/faculty/courses?facultyId=${session.user.id}`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.fc_id} className="p-4 border rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{course.course_name}</h2>
            <p className="text-gray-600 mb-2">Code: {course.course_code}</p>
            <p className="text-gray-600 mb-4">Section: {course.section_name}</p>
            
            <div className="flex gap-2">
              <Link 
                href={`/faculty/attendance/${course.fc_id}`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Attendance
              </Link>
              <Link 
                href={`/faculty/marks/${course.fc_id}`}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Marks
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 