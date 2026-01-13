import { supabase } from "@/app/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase.from("patients").select("id").limit(1);
  return new Response(JSON.stringify({ data, error }), { status: 200 });
}