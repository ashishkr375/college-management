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

    const assignments = await executeQuery(`
      SELECT 
        fc.faculty_course_id,
        c.course_id,
        c.course_code,
        c.course_name,
        s.section_id,
        s.section_name,
        p.programme_name,
        b.year as batch_year
      FROM FacultyCourses fc
      JOIN Courses c ON fc.course_id = c.course_id
      JOIN Sections s ON fc.section_id = s.section_id
      JOIN Batches b ON s.batch_id = b.batch_id
      JOIN Programmes p ON c.programme_id = p.programme_id
      WHERE fc.faculty_id = ?
      ORDER BY c.course_name, s.section_name
    `, [session.user.id]);

    return new Response(JSON.stringify(assignments), {
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