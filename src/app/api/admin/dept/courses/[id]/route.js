import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'dept_admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    const { course_code, course_name, credits, programme_id } = await request.json();

    // Verify the course belongs to admin's department
    const verifyQuery = `
      SELECT 1
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      JOIN Courses c ON p.programme_id = c.programme_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      AND c.course_id = ?
    `;

    const verified = await executeQuery(verifyQuery, [session.user.id, id]);

    if (verified.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await executeQuery(
      `UPDATE Courses 
       SET course_code = ?, course_name = ?, credits = ?, programme_id = ? 
       WHERE course_id = ?`,
      [course_code, course_name, credits, programme_id, id]
    );

    return new Response(JSON.stringify({ message: 'Course updated successfully' }), {
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

    // Verify the course belongs to admin's department
    const verifyQuery = `
      SELECT 1
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      JOIN Courses c ON p.programme_id = c.programme_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      AND c.course_id = ?
    `;

    const verified = await executeQuery(verifyQuery, [session.user.id, id]);

    if (verified.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if course has any assignments
    const [assignments] = await executeQuery(
      'SELECT COUNT(*) as count FROM FacultyCourses WHERE course_id = ?',
      [id]
    );

    if (assignments.count > 0) {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete course with existing assignments' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await executeQuery('DELETE FROM Courses WHERE course_id = ?', [id]);

    return new Response(JSON.stringify({ message: 'Course deleted successfully' }), {
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