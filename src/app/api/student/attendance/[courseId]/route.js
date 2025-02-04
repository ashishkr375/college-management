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
      SELECT 
        attendance_id, 
        start_date, 
        end_date, 
        total_classes, 
        present_count, 
        remark 
      FROM Attendance
      WHERE roll_number = ? AND faculty_course_id = ?
      ORDER BY start_date DESC
    `;

    const records = await executeQuery(recordsQuery, [session.user.roll_number, params.courseId]);

    // Calculate summary
    const summaryQuery = `
      SELECT 
        SUM(total_classes) as total_classes,
        SUM(CASE WHEN present_count >= 0 THEN present_count ELSE 0 END) as present_count
      FROM Attendance
      WHERE roll_number = ? AND faculty_course_id = ?
    `;

    const [summaryData] = await executeQuery(summaryQuery, [session.user.roll_number, params.courseId]);

    const summary = {
      total: summaryData.total_classes || 0,
      present: summaryData.present_count || 0,
      percentage: summaryData.total_classes ? (summaryData.present_count / summaryData.total_classes) * 100 : 0
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