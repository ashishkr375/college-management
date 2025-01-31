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
        c.course_code,
        c.course_name,
        COUNT(DISTINCT a.date) as total_classes,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN a.status = 'On Leave' THEN 1 ELSE 0 END) as \`leave\`,
        ROUND(
          (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(DISTINCT a.date), 0)
        ) as percentage
      FROM Students s
      JOIN Sections sec ON s.section_id = sec.section_id
      JOIN FacultyCourses fc ON sec.section_id = fc.section_id
      JOIN Courses c ON fc.course_id = c.course_id
      LEFT JOIN Attendance a ON a.roll_number = s.roll_number 
        AND a.course_code = c.course_code
      WHERE s.roll_number = ?
      GROUP BY c.course_code, c.course_name
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