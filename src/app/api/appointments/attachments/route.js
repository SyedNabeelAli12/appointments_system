import { supabase } from "@/app/lib/supabaseClient";

// Route: /api/appointments/attachments
export async function POST(req) {
  try {
    const { appointmentID } = await req.json();

    if (!appointmentID) {
      return new Response(JSON.stringify({ error: "Missing appointment ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase
      .from("appointments")
      .select("attachements")
      .eq("id", appointmentID)
      .single();

    if (error) {
      console.error("Error fetching attachments:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data.attachements || []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
