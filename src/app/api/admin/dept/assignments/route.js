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

    const assignments = await executeQuery(`
      SELECT 
        fc.faculty_course_id,
        c.course_code,
        c.course_name,
        f.full_name as faculty_name,
        s.section_name,
        p.programme_name,
        b.year as batch_year
      FROM FacultyCourses fc
      JOIN Courses c ON fc.course_id = c.course_id
      JOIN Faculty f ON fc.faculty_id = f.faculty_id
      JOIN Sections s ON fc.section_id = s.section_id
      JOIN Batches b ON s.batch_id = b.batch_id
      JOIN Programmes p ON c.programme_id = p.programme_id
      WHERE p.dept_id = (
        SELECT dept_id FROM Faculty WHERE faculty_id = ?
      )
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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'dept_admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { courseId, facultyId, sectionId } = await request.json();

    // Validate that all required fields are present
    if (!courseId || !facultyId || !sectionId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if assignment already exists
    const checkQuery = `
      SELECT 1 FROM FacultyCourses 
      WHERE course_id = ? AND section_id = ?
    `;
    
    const existing = await executeQuery(checkQuery, [courseId, sectionId]);
    
    if (existing.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Course already assigned to this section' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create new assignment
    const result = await executeQuery(`
      INSERT INTO FacultyCourses (faculty_id, course_id, section_id)
      VALUES (?, ?, ?)
    `, [facultyId, courseId, sectionId]);

    return new Response(JSON.stringify({ 
      message: 'Assignment created successfully',
      id: result.insertId 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Assignment error:', error); // For debugging
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 