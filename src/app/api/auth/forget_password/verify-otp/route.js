import { executeQuery } from "@/lib/db";
export async function POST(req) {
    try {
        const { email, otp } = await req.json();
        if (!email || !otp) {
            return new Response(JSON.stringify({ error: "Email and OTP are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const query = `
            SELECT * FROM otp 
            WHERE email = ? AND otp = ? AND expires_at > NOW()
        `;

        const result = await executeQuery(query, [email, otp]);

        if (!result || result.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ message: "OTP verified successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("OTP Verification Error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
