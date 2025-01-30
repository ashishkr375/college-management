import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'faculty') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { materialId } = params;

    // Verify ownership
    const verifyQuery = `
      SELECT 1 FROM CourseMaterials 
      WHERE material_id = ? AND faculty_id = ?
    `;
    const verified = await executeQuery(verifyQuery, [materialId, session.user.id]);

    if (verified.length === 0) {
      return new Response(JSON.stringify({ error: 'Material not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete from database
    await executeQuery(
      'DELETE FROM CourseMaterials WHERE material_id = ?',
      [materialId]
    );

    return new Response(JSON.stringify({ message: 'Material deleted successfully' }), {
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