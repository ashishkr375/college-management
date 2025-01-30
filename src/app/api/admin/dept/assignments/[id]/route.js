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

    const { id } = params;

    // First verify if the assignment belongs to the department admin's department
    const verifyQuery = `
      SELECT 1
      FROM Faculty admin
      JOIN Departments d ON admin.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      JOIN Courses c ON p.programme_id = c.programme_id
      JOIN FacultyCourses fc ON c.course_id = fc.course_id
      WHERE admin.faculty_id = ? 
      AND admin.is_dept_admin = 1
      AND fc.faculty_course_id = ?
    `;

    console.log('Verifying assignment:', { userId: session.user.id, assignmentId: id });
    const verified = await executeQuery(verifyQuery, [session.user.id, id]);

    if (verified.length === 0) {
      console.log('Assignment verification failed');
      return new Response(JSON.stringify({ 
        error: 'Assignment not found or you do not have permission to delete it' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Deleting assignment:', id);
    // If verified, proceed with deletion
    await executeQuery(
      'DELETE FROM FacultyCourses WHERE faculty_course_id = ?',
      [id]
    );

    return new Response(JSON.stringify({ 
      message: 'Assignment deleted successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete assignment',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 