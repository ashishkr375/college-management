import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'student') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const courses = await executeQuery(`
      SELECT 
        c.course_code,
        c.course_name,
        f.full_name as faculty_name,
        COUNT(DISTINCT a.date) as total_classes,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as classes_attended,
        ROUND(
          (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(DISTINCT a.date), 0)
        ) as attendance_percentage,
        COUNT(DISTINCT cm.material_id) as materials_count,
        (
          SELECT marks 
          FROM Marks m 
          WHERE m.roll_number = sc.roll_number 
          AND m.course_code = c.course_code 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as latest_marks
      FROM courses c
      JOIN FacultyCourses fc ON c.course_id = fc.course_id
      JOIN Faculty f ON fc.faculty_id = f.faculty_id
      LEFT JOIN Attendance a ON a.roll_number = s.roll_number 
        AND a.course_code = c.course_code
      LEFT JOIN CourseMaterials cm ON cm.course_id = c.course_id
      WHERE s.roll_number = ?
      GROUP BY c.course_id, c.course_code, c.course_name, f.full_name
    `, [session.user.roll_number]);
    
    return new Response(JSON.stringify(courses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 