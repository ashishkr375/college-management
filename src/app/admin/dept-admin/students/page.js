'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function StudentManagementPage() {
  const { data: session } = useSession();
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [selectedSection, setSelectedSection] = useState('');
  const [studentData, setStudentData] = useState({
    rollNumber: '',
    fullName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchInitialData();
    }
  }, [session]);

  async function fetchInitialData() {
    try {
      const [sectionsRes, studentsRes] = await Promise.all([
        fetch('/api/admin/dept/sections/all'),
        fetch('/api/admin/dept/students')
      ]);

      const [sectionsData, studentsData] = await Promise.all([
        sectionsRes.json(),
        studentsRes.json()
      ]);

      setSections(sectionsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/dept/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...studentData,
          sectionId: selectedSection
        }),
      });

      if (response.ok) {
        alert('Student added successfully');
        fetchInitialData();
        // Reset form
        setStudentData({
          rollNumber: '',
          fullName: '',
          email: '',
          password: ''
        });
        setSelectedSection('');
      } else {
        const data = await response.json();
        alert(data.error || 'Error adding student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(studentId) {
    if (!confirm('Are you sure you want to delete this student? This will delete all related data.')) return;

    try {
      const response = await fetch(`/api/admin/dept/students/${studentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Student deleted successfully');
        fetchInitialData();
      } else {
        const data = await response.json();
        alert(data.error || 'Error deleting student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Student Management</h1>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block mb-1">Roll Number</label>
            <input
              type="text"
              value={studentData.rollNumber}
              onChange={(e) => setStudentData({...studentData, rollNumber: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Full Name</label>
            <input
              type="text"
              value={studentData.fullName}
              onChange={(e) => setStudentData({...studentData, fullName: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={studentData.email}
              onChange={(e) => setStudentData({...studentData, email: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={studentData.password}
              onChange={(e) => setStudentData({...studentData, password: e.target.value})}
              className="w-full p-2 border rounded"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section.section_id} value={section.section_id}>
                  {section.programme_name} - {section.batch_year} - {section.section_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Adding...' : 'Add Student'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Roll Number</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Programme</th>
              <th className="px-4 py-2 border">Batch</th>
              <th className="px-4 py-2 border">Section</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.student_id}>
                <td className="px-4 py-2 border">{student.roll_number}</td>
                <td className="px-4 py-2 border">{student.full_name}</td>
                <td className="px-4 py-2 border">{student.email}</td>
                <td className="px-4 py-2 border">{student.programme_name}</td>
                <td className="px-4 py-2 border">{student.batch_year}</td>
                <td className="px-4 py-2 border">{student.section_name}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDelete(student.student_id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 