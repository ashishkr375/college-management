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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const month = parseInt(searchParams.get('month'), 10);
    const year = parseInt(searchParams.get('year'), 10);

    if (!courseId || isNaN(month) || isNaN(year)) {
      return new Response(JSON.stringify({ error: 'Invalid request parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const facultyCourses = await executeQuery(
      `SELECT faculty_course_id 
       FROM FacultyCourses 
       WHERE course_id = ? 
       AND section_id = (SELECT section_id FROM Students WHERE roll_number = ?)`,
      [courseId, session.user.roll_number]
    );

    if (!facultyCourses.length) {
      return new Response(JSON.stringify({ error: 'Course not found or not enrolled' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const facultyCourseId = facultyCourses[0].faculty_course_id;

    const attendance = await executeQuery(`
      SELECT 
        attendance_id,
        start_date,
        end_date,
        total_classes,
        present_count,
        remark
      FROM Attendance
      WHERE roll_number = ? 
      AND faculty_course_id = ?
      AND MONTH(start_date) = ? 
      AND YEAR(start_date) = ?
      ORDER BY start_date
    `, [session.user.roll_number, facultyCourseId, month, year]);

    // Calculate monthly statistics
    const statsResult = await executeQuery(`
      SELECT 
        COALESCE(SUM(total_classes), 0) AS total_classes,
        COALESCE(SUM(CASE WHEN present_count > 0 THEN present_count ELSE 0 END), 0) AS present_count,
        COALESCE(SUM(CASE WHEN present_count = 0 THEN total_classes ELSE 0 END), 0) AS leave_count,
        COALESCE(SUM(CASE WHEN present_count = -1 THEN total_classes ELSE 0 END), 0) AS absent_count
      FROM Attendance
      WHERE roll_number = ? 
      AND faculty_course_id = ?
      AND MONTH(start_date) = ? 
      AND YEAR(start_date) = ?
    `, [session.user.roll_number, facultyCourseId, month, year]);

    const stats = statsResult.length ? statsResult[0] : { total_classes: 0, present_count: 0, leave_count: 0, absent_count: 0 };

    const summary = {
      total: stats.total_classes,
      present: stats.present_count,
      leave: stats.leave_count,
      absent: stats.total_classes - stats.present_count - stats.leave_count,
      percentage: stats.total_classes > 0 
        ? ((stats.present_count / stats.total_classes) * 100).toFixed(2) 
        : 0
    };

    return new Response(JSON.stringify({
      attendance,
      stats: summary
    }), {
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