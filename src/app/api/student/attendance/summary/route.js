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

    const summary = await executeQuery(`
      SELECT 
          c.course_id,
          c.course_name, 
          c.course_code,
          SUM(a.total_classes) AS total_classes,
          SUM(CASE WHEN a.present_count >= 0 THEN a.present_count ELSE 0 END) AS present,
          (SUM(a.total_classes) - SUM(CASE WHEN a.present_count >= 0 THEN a.present_count ELSE 0 END)) AS absent,
          ROUND(
            (SUM(CASE WHEN a.present_count >= 0 THEN a.present_count ELSE 0 END) * 100.0) / 
            NULLIF(SUM(a.total_classes), 0)
          ) AS percentage
      FROM Students s
      JOIN FacultyCourses fc ON s.section_id = fc.section_id
      JOIN Courses c ON fc.course_id = c.course_id
      LEFT JOIN Attendance a ON a.roll_number = s.roll_number 
          AND a.faculty_course_id = fc.faculty_course_id
      WHERE s.roll_number = ?
      GROUP BY c.course_id, c.course_name
      ORDER BY c.course_name
  `, [session.user.roll_number]);

    return new Response(JSON.stringify(summary), {
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