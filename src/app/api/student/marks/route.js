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

    // Get course code
    const [course] = await executeQuery(
      'SELECT course_code FROM Courses WHERE course_id = ?',
      [courseId]
    );

    const marks = await executeQuery(`
      SELECT 
        assessment_type,
        marks,
        created_at
      FROM Marks
      WHERE roll_number = ?
      AND course_code = ?
      ORDER BY created_at DESC
    `, [session.user.roll_number, course.course_code]);

    return new Response(JSON.stringify(marks), {
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