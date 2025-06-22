import { supabase } from "@/app/lib/supabaseClient";

export async function POST(req) {
  try {
    const { category, dateFrom, dateTo, lastName, order } = await req.json();

    // Determine order direction for Supabase: 'asc' or 'desc' (default desc)
    const orderArrangement = order === 'asc' ? 'asc' : 'desc';

    // Base query: join with categories and patients, sorted by start ascending or descending
    let query = supabase
      .from('appointments')
      .select(`
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
      `)
      .order('start', { ascending: orderArrangement === 'asc' });

    // Apply optional Supabase-side filters
    if (category) query = query.eq('category', category);
    if (dateFrom) query = query.gte('start', dateFrom);
    if (dateTo) query = query.lte('end', dateTo);

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Filter by patient last name (if provided)
    let filtered = data;
    if (lastName) {
      const lower = lastName.toLowerCase();
      filtered = data.filter((appointment) =>
        appointment.patients?.lastname?.toLowerCase().includes(lower)
      );
    }

    console.log(filtered)

    return Response.json({ appointments: filtered }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
