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
    const assessmentType = searchParams.get('assessmentType');

    // Get course_code for the faculty_course_id
    const courseQuery = `
      SELECT c.course_code
      FROM FacultyCourses fc
      JOIN Courses c ON fc.course_id = c.course_id
      WHERE fc.faculty_course_id = ?
      AND fc.faculty_id = ?
    `;
    const courseResult = await executeQuery(courseQuery, [courseId, session.user.id]);
    const courseCode = courseResult[0].course_code;

    const marks = await executeQuery(`
      SELECT m.roll_number, m.marks, m.assessment_type, m.created_at
      FROM Marks m
      WHERE m.course_code = ?
      AND m.assessment_type = ?
      AND m.marked_by = ?
    `, [courseCode, assessmentType, session.user.id]);

    return new Response(JSON.stringify(marks), {
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

    const { courseId, marks } = await request.json();

    // Get course_code
    const courseQuery = `
      SELECT c.course_code
      FROM FacultyCourses fc
      JOIN Courses c ON fc.course_id = c.course_id
      WHERE fc.faculty_course_id = ?
      AND fc.faculty_id = ?
    `;
    const courseResult = await executeQuery(courseQuery, [courseId, session.user.id]);
    const courseCode = courseResult[0].course_code;

    await executeQuery('START TRANSACTION');

    try {
      // Delete existing marks for this assessment
      await executeQuery(`
        DELETE FROM Marks 
        WHERE course_code = ? 
        AND assessment_type = ?
        AND marked_by = ?
      `, [courseCode, marks[0].assessment_type, session.user.id]);

      // Insert new marks
      for (const mark of marks) {
        if (mark.marks) { // Only insert if marks are provided
          await executeQuery(`
            INSERT INTO Marks (
              roll_number,
              course_code,
              assessment_type,
              marks,
              marked_by
            ) VALUES (?, ?, ?, ?, ?)
          `, [
            mark.roll_number,
            courseCode,
            mark.assessment_type,
            mark.marks,
            session.user.id
          ]);
        }
      }

      await executeQuery('COMMIT');

      return new Response(JSON.stringify({ 
        message: 'Marks saved successfully',
        savedAssessment: marks[0].assessment_type
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
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
 