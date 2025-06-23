import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req) {
  try {
    const { referenceDate, limit = 10, category, lastName } = await req.json();

    if (!referenceDate) {
      return Response.json({ error: "Missing referenceDate" }, { status: 400 });
    }

    let query = supabase
      .from("appointments")
      .select(
        `
        id,
        start,
        end,
        title,
        notes,
        location,
        categories (
          id,
          label,
          color
        ),
        patients (
          id,
          firstname,
          lastname
        ),
         appointment_assignee (
      user,
      user_type
    )
      `
      )
      .lt("start", referenceDate)
      .order("start", { ascending: false }) // Get earlier (older) appointments
      .limit(limit);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Optional lastName filtering (client-side)
    let filtered = data;
    if (lastName) {
      const lower = lastName.toLowerCase();
      filtered = data.filter((app) =>
        app.patients?.lastname?.toLowerCase().includes(lower)
      );
    }

    return Response.json({ appointments: filtered }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
