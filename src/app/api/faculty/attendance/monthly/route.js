import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "faculty") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { faculty_course_id, attendance, start_date, end_date, total_classes } = await request.json();

    const courseQuery = `
      SELECT course_id 
      FROM FacultyCourses 
      WHERE faculty_course_id = ? 
      AND faculty_id = ?
    `;
    const courseResult = await executeQuery(courseQuery, [faculty_course_id, session.user.id]);

    if (courseResult.length === 0) {
      return new Response(JSON.stringify({ error: "Course not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const course_id = courseResult[0].course_id;

    await executeQuery("START TRANSACTION");

    try {
      await executeQuery(
        `DELETE FROM Attendance 
         WHERE faculty_course_id = ? 
         AND start_date = ? 
         AND end_date = ?`,
        [faculty_course_id, start_date, end_date]
      );

      for (const record of attendance) {
        await executeQuery(
          `INSERT INTO Attendance (
            roll_number,
            course_id,
            start_date,
            end_date,
            total_classes,
            present_count,
            faculty_course_id,
            remark,
            flag
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.roll_number,
            course_id, 
            start_date,
            end_date,
            total_classes,
            record.present_count,
            faculty_course_id,
            record.remark || null,
            1, 
          ]
        );
      }

      await executeQuery("COMMIT");

      return new Response(
        JSON.stringify({
          message: "Attendance saved successfully",
          start_date,
          end_date,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      await executeQuery("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
