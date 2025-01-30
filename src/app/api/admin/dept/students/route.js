import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcryptjs';

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
        s.student_id,
        s.roll_number,
        s.full_name,
        s.email,
        p.programme_name,
        b.year as batch_year,
        sec.section_name
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      JOIN Batches b ON p.programme_id = b.programme_id
      JOIN Sections sec ON b.batch_id = sec.batch_id
      JOIN Students s ON sec.section_id = s.section_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      ORDER BY b.year DESC, sec.section_name, s.roll_number
    `;

    const students = await executeQuery(query, [session.user.id]);
    
    return new Response(JSON.stringify(students), {
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

    const { rollNumber, fullName, email, password, sectionId } = await request.json();

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

    const verified = await executeQuery(verifyQuery, [session.user.id, sectionId]);

    if (verified.length === 0) {
      return new Response(JSON.stringify({ error: 'Section not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if roll number or email already exists
    const checkQuery = `
      SELECT 1 FROM Students 
      WHERE roll_number = ? OR email = ?
    `;
    
    const existing = await executeQuery(checkQuery, [rollNumber, email]);
    
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Roll number or email already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new student
    const insertQuery = `
      INSERT INTO Students (roll_number, full_name, email, password, section_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    await executeQuery(insertQuery, [rollNumber, fullName, email, hashedPassword, sectionId]);
    
    return new Response(JSON.stringify({ message: 'Student created successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 