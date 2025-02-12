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
    c.course_id,
    f.full_name AS faculty_name,
    att.total_classes, 
    att.classes_attended,
    ROUND(
        (att.classes_attended * 100.0) / NULLIF(att.total_classes, 0), 2
    ) AS attendance_percentage,
    COUNT(DISTINCT cm.material_id) AS materials_count,
    (
        SELECT m.marks 
        FROM Marks m 
        WHERE m.roll_number =?
        AND m.course_code = c.course_code 
        AND m.status = 'final'
        ORDER BY m.created_at DESC 
        LIMIT 1
    ) AS latest_marks
FROM Courses c
JOIN FacultyCourses fc ON c.course_id = fc.course_id
JOIN Faculty f ON fc.faculty_id = f.faculty_id
LEFT JOIN (
    -- Subquery to correctly calculate attendance
    SELECT 
        a.course_id,
        SUM(a.total_classes) AS total_classes,
        SUM(a.present_count) AS classes_attended
    FROM Attendance a
    WHERE a.roll_number = ?
    GROUP BY a.course_id
) att ON att.course_id = c.course_id
LEFT JOIN CourseMaterials cm ON cm.course_id = c.course_id
GROUP BY c.course_id, c.course_code, c.course_name, f.full_name, att.total_classes, att.classes_attended;

      
      `,[session.user.roll_number,session.user.roll_number]);
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