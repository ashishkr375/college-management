'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function StudentMarksPage({ params }) {
  const { data: session } = useSession();
  const [marks, setMarks] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMarks();
    }
  }, [session]);

  async function fetchMarks() {
    try {
      const response = await fetch(`/api/student/marks/${params.courseId}`);
      const data = await response.json();
      setMarks(data.marks);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching marks:', error);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Course Marks</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Total Score</h3>
        <p className="text-2xl">{total.toFixed(2)}/100</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Assessment Type</th>
              <th className="px-4 py-2 border">Score</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((mark) => (
              <tr key={mark.mark_id}>
                <td className="px-4 py-2 border">{mark.assessment_type}</td>
                <td className="px-4 py-2 border">{mark.score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 