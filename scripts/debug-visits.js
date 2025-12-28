const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS for debugging
);

async function checkData() {
  console.log("Checking hospital_visits...");
  const { data: visits, error } = await supabase.from('hospital_visits').select('*');
  if (error) {
    console.error("Error fetching visits:", error);
    return;
  }
  console.log("Visits count:", visits.length);
  console.log("Visits:", JSON.stringify(visits, null, 2));

  console.log("Checking hedgehogs...");
  const { data: hedgehogs } = await supabase.from('hedgehogs').select('id, name, user_id');
  console.log("Hedgehogs:", JSON.stringify(hedgehogs, null, 2));
}

checkData();
