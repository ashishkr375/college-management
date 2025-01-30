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
        p.programme_id,
        p.programme_name,
        p.level
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      ORDER BY p.level, p.programme_name
    `;

    const programmes = await executeQuery(query, [session.user.id]);
    
    return new Response(JSON.stringify(programmes), {
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