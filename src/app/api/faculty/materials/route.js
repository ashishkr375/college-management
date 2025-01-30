import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'faculty') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return new Response(JSON.stringify({ error: 'Missing courseId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const materials = await executeQuery(`
      SELECT *
      FROM CourseMaterials
      WHERE course_id = ? AND faculty_id = ?
      ORDER BY upload_date DESC
    `, [courseId, session.user.id]);

    return new Response(JSON.stringify(materials), {
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
    if (!session || session.user.role !== 'faculty') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { type, description, fileUrl, courseId } = await request.json();

    // Validate URL
    try {
      new URL(fileUrl);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid file URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await executeQuery(`
      INSERT INTO CourseMaterials (
        type,
        description,
        file_url,
        faculty_id,
        course_id
      ) VALUES (?, ?, ?, ?, ?)
    `, [type, description, fileUrl, session.user.id, courseId]);

    return new Response(JSON.stringify({ 
      message: 'Material added successfully',
      id: result.insertId 
    }), {
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