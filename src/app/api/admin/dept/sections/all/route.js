import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'dept_admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const query = `
      SELECT 
        s.section_id,
        s.section_name,
        b.year as batch_year,
        p.programme_name,
        p.level,
        COUNT(st.student_id) as student_count
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      JOIN Batches b ON p.programme_id = b.programme_id
      JOIN Sections s ON b.batch_id = s.batch_id
      LEFT JOIN Students st ON s.section_id = st.section_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      GROUP BY s.section_id
      ORDER BY b.year DESC, p.programme_name, s.section_name
    `;

    const sections = await executeQuery(query, [session.user.id]);
    
    return new Response(JSON.stringify(sections), {
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