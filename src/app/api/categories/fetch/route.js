import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, label, color');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(data)

    return res.status(200).json({ categories: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
