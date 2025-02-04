import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'faculty') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const faculty_course_id = searchParams.get('faculty_course_id');  // ✅ Correct query param

    // Get course_id for the faculty_course_id
    const courseQuery = `
      SELECT course_id 
      FROM FacultyCourses 
      WHERE faculty_course_id = ? 
      AND faculty_id = ?
    `;
    const courseResult = await executeQuery(courseQuery, [faculty_course_id, session.user.id]);

    if (courseResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const course_id = courseResult[0].course_id;

    // Get distinct attendance dates with total records
    const dates = await executeQuery(`
      SELECT 
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        COUNT(*) AS record_count
      FROM Attendance
      WHERE course_id = ?
      AND faculty_course_id = ?
      GROUP BY start_date, end_date
      ORDER BY start_date DESC
    `, [course_id, faculty_course_id]);

    return new Response(JSON.stringify(dates), {
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
