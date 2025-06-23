const { createClient } = require('@supabase/supabase-js');


// console.log(process.env.NEXT_PUBLIC_SUPABASEKEY)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASEURL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASEKEY
export const supabase = createClient(supabaseUrl, supabaseKey);