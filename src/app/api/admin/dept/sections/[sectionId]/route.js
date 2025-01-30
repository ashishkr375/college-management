import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'dept_admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify section belongs to admin's department
    const verifyQuery = `
      SELECT 1
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      JOIN Batches b ON p.programme_id = b.programme_id
      JOIN Sections s ON b.batch_id = s.batch_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      AND s.section_id = ?
    `;

    const verified = await executeQuery(verifyQuery, [session.user.id, params.sectionId]);

    if (verified.length === 0) {
      return new Response(JSON.stringify({ error: 'Section not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // Delete related records first
      await executeQuery('DELETE FROM FacultyCourses WHERE section_id = ?', [params.sectionId]);
      await executeQuery('UPDATE Students SET section_id = NULL WHERE section_id = ?', [params.sectionId]);
      
      // Delete the section
      await executeQuery('DELETE FROM Sections WHERE section_id = ?', [params.sectionId]);
      
      await executeQuery('COMMIT');
      
      return new Response(JSON.stringify({ message: 'Section deleted successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 