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
    const facultyCourseId = searchParams.get('courseId');
    const date = searchParams.get('date');

    if (!facultyCourseId || !date) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get course_code for the faculty_course_id
    const courseQuery = `
      SELECT c.course_code
      FROM FacultyCourses fc
      JOIN Courses c ON fc.course_id = c.course_id
      WHERE fc.faculty_course_id = ?
      AND fc.faculty_id = ?
    `;
    const courseResult = await executeQuery(courseQuery, [facultyCourseId, session.user.id]);

    if (courseResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const courseCode = courseResult[0].course_code;

    const attendance = await executeQuery(`
      SELECT roll_number, status
      FROM Attendance
      WHERE course_code = ?
      AND date = ?
      AND marked_by = ?
    `, [courseCode, date, session.user.id]);

    return new Response(JSON.stringify(attendance), {
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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'faculty') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { courseId: facultyCourseId, attendance, date } = await request.json();

    // Get course_code for the faculty_course_id
    const courseQuery = `
      SELECT c.course_code
      FROM FacultyCourses fc
      JOIN Courses c ON fc.course_id = c.course_id
      WHERE fc.faculty_course_id = ?
      AND fc.faculty_id = ?
    `;
    const courseResult = await executeQuery(courseQuery, [facultyCourseId, session.user.id]);
    
    if (courseResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const courseCode = courseResult[0].course_code;

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // Delete existing records
      await executeQuery(`
        DELETE FROM Attendance 
        WHERE course_code = ? 
        AND date = ?
        AND marked_by = ?
      `, [courseCode, date, session.user.id]);

      // Insert new records
      for (const record of attendance) {
        await executeQuery(`
          INSERT INTO Attendance (
            roll_number,
            course_code,
            date,
            status,
            marked_by
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          record.roll_number,
          courseCode,
          date,
          record.status,
          session.user.id
        ]);
      }

      // Commit transaction
      await executeQuery('COMMIT');

      return new Response(JSON.stringify({ 
        message: 'Attendance saved successfully',
        savedDate: date
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Rollback on error
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 