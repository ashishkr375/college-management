import { log } from "console";

export async function GET(request, {params}) {
    try {
        console.log(params)
        return new Response(JSON.stringify({ success : "ok" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
    }
}