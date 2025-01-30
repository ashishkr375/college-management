import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const month = parseInt(searchParams.get('month'));
    const year = parseInt(searchParams.get('year'));

    // Get course code
    const [course] = await executeQuery(
      'SELECT course_code FROM Courses WHERE course_id = ?',
      [courseId]
    );

    // Get attendance records
    const attendance = await executeQuery(`
      SELECT date, status
      FROM Attendance
      WHERE roll_number = ?
      AND course_code = ?
      AND MONTH(date) = ?
      AND YEAR(date) = ?
      ORDER BY date
    `, [session.user.roll_number, course.course_code, month, year]);

    // Calculate monthly statistics
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) as leave,
        ROUND(
          (SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) * 100.0) / 
          COUNT(*)
        ) as percentage
      FROM Attendance
      WHERE roll_number = ?
      AND course_code = ?
      AND MONTH(date) = ?
      AND YEAR(date) = ?
    `, [session.user.roll_number, course.course_code, month, year]);

    return new Response(JSON.stringify({
      attendance,
      stats: stats[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 