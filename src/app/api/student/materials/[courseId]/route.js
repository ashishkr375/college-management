import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'student') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify student is enrolled in the course
    const enrollmentQuery = `
      SELECT 1
      FROM Students s
      JOIN Sections sec ON s.section_id = sec.section_id
      JOIN FacultyCourses fc ON sec.section_id = fc.section_id
      WHERE s.student_id = ? AND fc.course_id = ?
    `;

    const enrollment = await executeQuery(enrollmentQuery, [session.user.id, params.courseId]);

    if (enrollment.length === 0) {
      return new Response(JSON.stringify({ error: 'Not enrolled in this course' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get course materials
    const materialsQuery = `
      SELECT 
        cm.material_id,
        cm.type,
        cm.description,
        cm.file_url,
        cm.upload_date,
        f.full_name as uploaded_by
      FROM CourseMaterials cm
      JOIN Faculty f ON cm.faculty_id = f.faculty_id
      WHERE cm.course_id = ?
      ORDER BY cm.upload_date DESC
    `;

    const materials = await executeQuery(materialsQuery, [params.courseId]);

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