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
    const courseId = searchParams.get('courseId');

    // Get course_code
    const courseQuery = `
      SELECT c.course_code
      FROM FacultyCourses fc
      JOIN Courses c ON fc.course_id = c.course_id
      WHERE fc.faculty_course_id = ?
      AND fc.faculty_id = ?
    `;
    const courseResult = await executeQuery(courseQuery, [courseId, session.user.id]);
    const courseCode = courseResult[0].course_code;

    const assessments = await executeQuery(`
      SELECT 
        assessment_type,
        created_at,
        COUNT(DISTINCT roll_number) as student_count,
        AVG(marks) as average_marks
      FROM Marks
      WHERE course_code = ?
      AND marked_by = ?
      GROUP BY assessment_type, DATE(created_at)
      ORDER BY created_at DESC
    `, [courseCode, session.user.id]);

    return new Response(JSON.stringify(assessments), {
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