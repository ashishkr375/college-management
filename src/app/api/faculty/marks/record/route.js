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
    const assessmentType = searchParams.get('assessmentType');
    const date = searchParams.get('date');

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

    // Get marks for specific date
    const marks = await executeQuery(`
      SELECT m.roll_number, m.marks, m.assessment_type, m.created_at
      FROM Marks m
      WHERE m.course_code = ?
      AND m.assessment_type = ?
      AND m.marked_by = ?
      AND DATE(m.created_at) = DATE(?)
    `, [courseCode, assessmentType, session.user.id, date]);

    return new Response(JSON.stringify({ marks }), {
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