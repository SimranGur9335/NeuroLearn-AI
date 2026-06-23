const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nowepoiasehxhkebkqkf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vd2Vwb2lhc2VoeGhlYmtxa2YiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNTk5NjgwMCwiZXhwIjoyMDQxNTcyODAwfQ.dummy';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  try {
    console.log("Listing buckets...");
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error("Error listing buckets:", error);
    } else {
      console.log("Buckets:", data);
    }
  } catch (err) {
    console.error("Exception occurred:", err);
  }
}

run();
