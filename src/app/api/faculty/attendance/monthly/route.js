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

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "faculty") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const faculty_course_id = url.searchParams.get("faculty_course_id");
    const start_date = url.searchParams.get("start_date");
    const end_date = url.searchParams.get("end_date");

    if (!faculty_course_id || !start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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

    const attendanceQuery = `
      SELECT 
      a.roll_number,
      s.full_name,
      s.email,
      a.total_classes,
      a.present_count,
      a.remark
    FROM Attendance a
    JOIN Students s ON a.roll_number = s.roll_number
    WHERE a.faculty_course_id = ?
      AND a.start_date = ?
      AND a.end_date = ?
    ORDER BY 
      CASE 
        WHEN s.roll_number REGEXP '^[0-9]+$' THEN CAST(s.roll_number AS UNSIGNED)
        ELSE NULL 
      END,
      s.roll_number;
    `;

    const attendanceData = await executeQuery(attendanceQuery, [faculty_course_id, start_date, end_date]);

    return new Response(
      JSON.stringify({
        attendance: attendanceData.map(record => ({
          roll_number: record.roll_number,
          full_name: record.full_name,
          email: record.email,
          present_count: record.present_count,
          absent_count: record.absent_count,
          remark: record.remark || "",
          total_classes: record.total_classes
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}