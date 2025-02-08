import { executeQuery } from "@/lib/db";
import * as nodemailer from "nodemailer"
export async function mailSender(email,subject,message){
  try {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass:'ywdx iadz wexi ozho',
        },
        tls: {
            rejectUnauthorized: false, 
        },
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: subject,
        text: message,
    };

    await transporter.sendMail(mailOptions);
} catch (error) {
    console.error("Error sending email:", error);
    throw error;
}
}

function generateOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userQuery = `
      SELECT 'superadmin' AS role, id, email FROM superadmin WHERE email = ?
      UNION ALL
      SELECT 'faculty' AS role, faculty_id, email FROM faculty WHERE email = ?
      UNION ALL
      SELECT 'students' AS role, student_id, email FROM students WHERE email = ?
      LIMIT 1;
    `;

    const user = await executeQuery(userQuery, [email, email, email]);

    if (!user || user.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await executeQuery("START TRANSACTION");

    try {
      await executeQuery(
        `INSERT INTO otp (email, otp, expires_at) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?;`,
        [email, otp, expiresAt, otp, expiresAt]
      );

      await executeQuery("COMMIT");

      const subject = "Email-Verification";
      const message = `Your OTP for Email-Verification is: ${otp}`;
      await mailSender(email, subject, message);

      return new Response(
        JSON.stringify({ message: "OTP sent to email" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      await executeQuery("ROLLBACK");
      throw error;
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
