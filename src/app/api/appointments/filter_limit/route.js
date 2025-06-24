import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req) {
  try {
    const {
      category,
      dateFrom,
      dateTo,
      lastName,
      order,
      referenceDate,
      direction,
      limit = 10,
    } = await req.json();

    let query = supabase
      .from("appointments")
      .select(
        `
        id,
        start,
        location,
        end,
        title,
        notes,
        categories (
          id,
          label,
          color
        ),
        patients (
          id,
          firstname,
          lastname
        )
      `
      )
      .order("start", { ascending: order === "asc" });

    const fromDate = dateFrom ? new Date(dateFrom).toISOString() : null;
    const toDate = dateTo
      ? new Date(new Date(dateTo).setHours(23, 59, 59, 999)).toISOString()
      : null;

    if (category) query = query.eq("category", category);
    if (dateFrom) query = query.gte("start", fromDate);
    if (dateTo) query = query.lte("end", toDate);

    // Load older/newer around a reference point
    if (referenceDate && direction === "before") {
      query = query.lt("start", referenceDate);
    } else if (referenceDate && direction === "after") {
      query = query.gt("start", referenceDate);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    console.log(data)

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log(data);

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
