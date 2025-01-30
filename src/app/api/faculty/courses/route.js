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

    const searchParams = new URL(request.url).searchParams;
    const facultyId = searchParams.get('facultyId');

    const query = `
      SELECT 
        fc.fc_id,
        c.course_code,
        c.course_name,
        s.section_name,
        b.year,
        p.programme_name
      FROM FacultyCourses fc
      JOIN Courses c ON fc.course_id = c.course_id
      JOIN Sections s ON fc.section_id = s.section_id
      JOIN Batches b ON s.batch_id = b.batch_id
      JOIN Programmes p ON b.programme_id = p.programme_id
      WHERE fc.faculty_id = ?
      ORDER BY c.course_name
    `;

    const courses = await executeQuery(query, [facultyId]);
    
    return new Response(JSON.stringify(courses), {
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