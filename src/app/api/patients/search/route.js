// app/api/patients/search/route.js
import { supabase } from "../../../lib/supabaseClient";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return new Response(JSON.stringify({ labels: [] }), { status: 200 });
  }

  try {
    const { data, error } = await supabase
      .from("patients")
      .select("id, firstname, lastname, birth_date")
      .ilike("lastname", `%${query}%`) // case-insensitive match
      .eq("active", true);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ labels: data }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}
