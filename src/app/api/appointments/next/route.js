import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req) {
  try {
    const { referenceDate, limit = 10 } = await req.json();

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        start,
        end,
        location,
        title,
        notes,
        categories ( id, label, color ),
        patients ( id, firstname, lastname )
      `)
      .gt("start", referenceDate)
      .order("start", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ appointments: data }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error in /next:", err);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
