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
        s.section_id,
        s.section_name,
        b.year as batch_year,
        p.programme_name,
        p.level
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      JOIN Batches b ON p.programme_id = b.programme_id
      JOIN Sections s ON b.batch_id = s.batch_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      ORDER BY b.year DESC, s.section_name
    `;

    const sections = await executeQuery(query, [session.user.id]);
    
    return new Response(JSON.stringify(sections), {
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

    const { batchId, sectionName } = await request.json();

    // Verify batch belongs to admin's department
    const verifyQuery = `
      SELECT 1
      FROM Faculty f
      JOIN Departments d ON f.dept_id = d.dept_id
      JOIN Programmes p ON d.dept_id = p.dept_id
      JOIN Batches b ON p.programme_id = b.programme_id
      WHERE f.faculty_id = ? AND f.is_dept_admin = 1
      AND b.batch_id = ?
    `;

    const verified = await executeQuery(verifyQuery, [session.user.id, batchId]);

    if (verified.length === 0) {
      return new Response(JSON.stringify({ error: 'Batch not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if section already exists
    const checkQuery = `
      SELECT 1 FROM Sections 
      WHERE batch_id = ? AND section_name = ?
    `;
    
    const existing = await executeQuery(checkQuery, [batchId, sectionName]);
    
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'Section already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create new section
    const insertQuery = `
      INSERT INTO Sections (batch_id, section_name)
      VALUES (?, ?)
    `;

    await executeQuery(insertQuery, [batchId, sectionName]);
    
    return new Response(JSON.stringify({ message: 'Section created successfully' }), {
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