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

    const { assignmentId } = params;

    // Verify if the assignment belongs to the department admin's department
    const verifyQuery = `
      SELECT fc.faculty_course_id
      FROM FacultyCourses fc
      JOIN Courses c ON fc.course_id = c.course_id
      JOIN Programmes p ON c.programme_id = p.programme_id
      JOIN Faculty f ON f.dept_id = p.dept_id
      WHERE f.faculty_id = ? 
      AND f.is_dept_admin = 1
      AND fc.faculty_course_id = ?
    `;

    console.log('Verifying assignment:', { userId: session.user.id, assignmentId });
    const verified = await executeQuery(verifyQuery, [session.user.id, assignmentId]);

    if (verified.length === 0) {
      console.log('Assignment verification failed');
      return new Response(JSON.stringify({ 
        error: 'Assignment not found or you do not have permission to delete it' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If verified, proceed with deletion
    await executeQuery(
      'DELETE FROM FacultyCourses WHERE faculty_course_id = ?',
      [assignmentId]
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