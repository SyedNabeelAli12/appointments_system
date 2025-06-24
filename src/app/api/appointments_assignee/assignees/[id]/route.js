import { supabase } from "../../../../lib/supabaseClient";

export async function GET(req, { params }) {
  try {
    const appointmentId = params.id;  // no await here

    const { data, error } = await supabase
      .from("appointment_assignee")
      .select("user, user_type")
      .eq("appointment", appointmentId);

    if (error) {
      console.error("Error fetching assignees:", error);
      return new Response(
        JSON.stringify({ error: "Fehler beim Laden der zugewiesenen Benutzer" }),
        { status: 500 }
      );
    }

    console.log(data);
    return new Response(JSON.stringify({ assignees: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Ungültige Anfrage" }), {
      status: 400,
    });
  }
}
