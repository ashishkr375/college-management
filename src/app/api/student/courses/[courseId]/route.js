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

    const courseInfo = await executeQuery(`
      SELECT 
        c.course_id,
        c.course_code,
        c.course_name,
        f.full_name as faculty_name
      FROM Students s
      JOIN Sections sec ON s.section_id = sec.section_id
      JOIN FacultyCourses fc ON sec.section_id = fc.section_id
      JOIN Courses c ON fc.course_id = c.course_id
      JOIN Faculty f ON fc.faculty_id = f.faculty_id
      WHERE s.roll_number = ?
      AND c.course_id = ?
    `, [session.user.roll_number, params.courseId]);

    if (!courseInfo.length) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(courseInfo[0]), {
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