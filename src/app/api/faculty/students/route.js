import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user);

    if (!session || session.user.role !== 'faculty') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the courseId from query params
    const { searchParams } = new URL(request.url);
    const facultyCourseId = searchParams.get('courseId');

    if (!facultyCourseId) {
      return new Response(JSON.stringify({ error: 'Course ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get students for this faculty course
    const students = await executeQuery(`
      SELECT DISTINCT
        s.roll_number,
        s.full_name,
        s.email,
        sec.section_name,
        p.programme_name,
        b.year as batch_year
      FROM Students s
      JOIN Sections sec ON s.section_id = sec.section_id
      JOIN Batches b ON sec.batch_id = b.batch_id
      JOIN Programmes p ON b.programme_id = p.programme_id
      JOIN FacultyCourses fc ON sec.section_id = fc.section_id
      WHERE fc.faculty_course_id = ?
      AND fc.faculty_id = ?
      ORDER BY s.roll_number
    `, [facultyCourseId, session.user.id]);

    //console.log('Found students:', students);

    return new Response(JSON.stringify(students), {
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