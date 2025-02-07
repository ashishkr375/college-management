import { authOptions } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { getServerSession } from "next-auth";

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

        // Insert marks as draft
        await executeQuery('START TRANSACTION');

        try {

            // Delete existing marks for this assessment
            await executeQuery(`
            DELETE FROM Marks 
            WHERE course_code = ? 
            AND assessment_type = ?
            AND marked_by = ?
        `, [courseCode, marks[0].assessment_type, session.user.id]);

            for (const mark of marks) {
                if (mark.marks) {
                    await executeQuery(`
              INSERT INTO Marks (
                roll_number,
                course_code,
                assessment_type,
                marks,
                marked_by,
                status
              ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                        mark.roll_number,
                        courseCode,
                        mark.assessment_type,
                        mark.marks,
                        session.user.id,
                        'draft', // Status is 'draft' for unsaved marks
                    ]);
                }
            }

            await executeQuery('COMMIT');

            return new Response(JSON.stringify({
                message: 'Draft marks saved successfully',
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
