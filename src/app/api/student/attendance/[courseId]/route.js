import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'student') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get attendance records
    const recordsQuery = `
      SELECT attendance_id, date, status
      FROM Attendance
      WHERE student_id = ? AND course_id = ?
      ORDER BY date DESC
    `;

    const records = await executeQuery(recordsQuery, [session.user.id, params.courseId]);

    // Calculate summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
      FROM Attendance
      WHERE student_id = ? AND course_id = ?
    `;

    const [summaryData] = await executeQuery(summaryQuery, [session.user.id, params.courseId]);
    
    const summary = {
      total: summaryData.total || 0,
      present: summaryData.present || 0,
      percentage: summaryData.total ? (summaryData.present / summaryData.total) * 100 : 0
    };

    return new Response(JSON.stringify({ records, summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 