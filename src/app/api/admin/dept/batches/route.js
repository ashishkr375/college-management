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

    const searchParams = new URL(request.url).searchParams;
    const programmeId = searchParams.get('programmeId');

    if (!programmeId) {
      return new Response(JSON.stringify({ error: 'Programme ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify programme belongs to admin's department
    const verifyQuery = `
      SELECT 1
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      AND p.programme_id = ?
    `;

    const verified = await executeQuery(verifyQuery, [session.user.id, programmeId]);

    if (verified.length === 0) {
      return new Response(JSON.stringify({ error: 'Programme not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const query = `
      SELECT batch_id, year
      FROM Batches
      WHERE programme_id = ?
      ORDER BY year DESC
    `;

    const batches = await executeQuery(query, [programmeId]);
    
    return new Response(JSON.stringify(batches), {
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