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
    const facultyCourseId = searchParams.get('faculty_course_id');
    const start_date = searchParams.get('date');

    if (!facultyCourseId || !start_date) {
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
      SELECT roll_number, present_count as status,end_date
      FROM Attendance
      WHERE faculty_course_id = ?
      AND start_date = ?
    `, [facultyCourseId, start_date]);
      
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

    const { faculty_course_id, attendance, start_date, end_date, total_classes } = await request.json();

    // Get course_id for the faculty_course_id
    const courseQuery = `
      SELECT course_id 
      FROM FacultyCourses 
      WHERE faculty_course_id = ? 
      AND faculty_id = ?
    `;
    const courseResult = await executeQuery(courseQuery, [faculty_course_id, session.user.id]);

    if (courseResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const course_id = courseResult[0].course_id;

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // Delete existing attendance records for the given period
      await executeQuery(`
        DELETE FROM Attendance 
        WHERE faculty_course_id = ? 
        AND start_date = ? 
        AND end_date = ?
      `, [faculty_course_id, start_date, end_date]);

      // Insert new attendance records
      for (const record of attendance) {
        await executeQuery(`
          INSERT INTO Attendance (
            roll_number,
            course_id,
            start_date,
            end_date,
            total_classes,
            present_count,
            faculty_course_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          record.roll_number,
          course_id,
          start_date,
          end_date,
          total_classes,
          parseInt(record.status),  // Assuming 1 for present, 0 for absent
          faculty_course_id
        ]);
      }

      // Commit transaction
      await executeQuery('COMMIT');

      return new Response(JSON.stringify({ 
        message: 'Attendance saved successfully',
        start_date,
        end_date
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
