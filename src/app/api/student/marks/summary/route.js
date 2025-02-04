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

    const summary = await executeQuery(`
      SELECT 
          c.course_code,
          c.course_name,
          m.assessment_type,
          m.marks,
          m.created_at
      FROM Students s
      JOIN Sections sec ON s.section_id = sec.section_id
      JOIN FacultyCourses fc ON sec.section_id = fc.section_id
      JOIN Courses c ON fc.course_id = c.course_id
      LEFT JOIN Marks m ON m.roll_number = s.roll_number 
          AND m.course_code = c.course_code
      WHERE s.roll_number = ?
      ORDER BY c.course_name, m.assessment_type
  `, [session.user.roll_number]);
  

    // Organize data by course
    const marksByCourse = summary.reduce((acc, record) => {
      if (!acc[record.course_code]) {
        acc[record.course_code] = {
          course_code: record.course_code,
          course_name: record.course_name,
          assessments: {}
        };
      }
      if (record.assessment_type) {
        acc[record.course_code].assessments[record.assessment_type] = {
          marks: record.marks,
          date: record.created_at
        };
      }
      return acc;
    }, {});

    return new Response(JSON.stringify(Object.values(marksByCourse)), {
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