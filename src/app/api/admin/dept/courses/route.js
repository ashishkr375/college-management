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

    const courses = await executeQuery(`
      SELECT 
        c.*,
        p.programme_name
      FROM Courses c
      JOIN Programmes p ON c.programme_id = p.programme_id
      WHERE p.dept_id = (
        SELECT dept_id FROM Faculty WHERE faculty_id = ?
      )
    `, [session.user.id]);

    return new Response(JSON.stringify(courses), {
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

    const data = await request.json();
    
    // Verify the programme belongs to the admin's department
    const verifyQuery = `
      SELECT 1 
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      AND p.programme_id = ?
    `;

    const verified = await executeQuery(verifyQuery, [
      session.user.id,
      data.programme_id
    ]);

    if (verified.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid programme selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await executeQuery(`
      INSERT INTO Courses (
        course_code,
        course_name,
        credits,
        programme_id
      ) VALUES (?, ?, ?, ?)
    `, [
      data.course_code,
      data.course_name,
      data.credits,
      data.programme_id
    ]);

    return new Response(JSON.stringify({ id: result.insertId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Check for duplicate course code error
    if (error.code === 'ER_DUP_ENTRY') {
      return new Response(JSON.stringify({ 
        error: 'Course code already exists' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 