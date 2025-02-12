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
    const courseCode = await executeQuery(`SELECT course_code FROM Courses WHERE course_id = ?`, [params.courseId]);
    // Get marks with assessment weights
    const query = `
    SELECT 
        m.mark_id,
        m.assessment_type,
        m.marks AS score,
        CASE 
            WHEN m.assessment_type = 'Mid Sem' THEN 30
            WHEN m.assessment_type = 'Class Test' THEN 20
            WHEN m.assessment_type = 'Assignment' THEN 10
            WHEN m.assessment_type = 'Lab Internal' THEN 25
            WHEN m.assessment_type = 'Lab External' THEN 15
            ELSE 0  -- Handles unexpected assessment types
        END AS weight
    FROM Marks m
    WHERE m.roll_number = ? AND m.course_code = ? AND m.status = 'final'
    ORDER BY m.assessment_type
`;

    const marks = await executeQuery(query, [session.user.roll_number,courseCode[0].course_code]);

    // Calculate total weighted score
    const total = marks.reduce((sum, mark) => {
      return sum + (mark.score * mark.weight / 100);
    }, 0);

    return new Response(JSON.stringify({ marks, total }), {
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