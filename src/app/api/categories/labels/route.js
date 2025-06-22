// app/api/categories/labels/route.js
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id , label, color", { distinct: true });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }
console.log(data)
    return new Response(JSON.stringify({ labels: data }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
}
