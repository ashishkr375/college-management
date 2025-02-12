import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { email, newPassword } = await req.json();

  if (!email || !newPassword) {
    return new Response(JSON.stringify({ message: 'Email and newPassword are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const userQuery = `
      SELECT 'superadmin' AS role, id, email FROM SuperAdmin WHERE email = ?
      UNION ALL
      SELECT 'faculty' AS role, faculty_id, email FROM Faculty WHERE email = ?
      UNION ALL
      SELECT 'students' AS role, student_id, email FROM Students WHERE email = ?
      LIMIT 1;
    `;

    const user = await executeQuery(userQuery, [email, email, email]);

    if (!user || user.length === 0) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { role } = user[0];

    await executeQuery('START TRANSACTION');

    try {
      let updatePasswordQuery = '';
      let values = [hashedPassword, email];

      if (role === 'students') {
        updatePasswordQuery = `UPDATE Students SET password = ? WHERE email = ?`;
      } else if (role === 'faculty') {
        updatePasswordQuery = `UPDATE Faculty SET password = ? WHERE email = ?`;
      } else if (role === 'superadmin') {
        updatePasswordQuery = `UPDATE SuperAdmin SET password = ? WHERE email = ?`;
      }

      if (updatePasswordQuery) {
        await executeQuery(updatePasswordQuery, values);
      }

      await executeQuery('DELETE FROM otp WHERE email = ?', [email]);

      await executeQuery('COMMIT');

      return new Response(
        JSON.stringify({ message: 'Password updated successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      await executeQuery('ROLLBACK');
      console.error("Error during password update:", error);
      throw error;
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
