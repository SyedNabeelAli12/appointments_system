import { supabase } from "../../../lib/supabaseClient";

export async function PUT(req, res) {
  try {
    const body = await req.json();

    const { id, start, end, location, notes, title, category, patient } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: "Appointment ID is required" }), {
        status: 400,
      });
    }

    // Update appointment
    const { error } = await supabase
      .from("appointments")
      .update({
        start,
        end,
        location,
        notes,
        title,
        category,
        patient,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ message: "Appointment updated", id }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
