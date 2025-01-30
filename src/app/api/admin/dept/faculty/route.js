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
      SELECT f2.faculty_id, f2.employee_id, f2.full_name
      FROM Faculty f1
      JOIN Faculty f2 ON f1.dept_id = f2.dept_id
      WHERE f1.faculty_id = ? AND f1.is_dept_admin = 1
      ORDER BY f2.full_name
    `;

    const faculty = await executeQuery(query, [session.user.id]);
    
    return new Response(JSON.stringify(faculty), {
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