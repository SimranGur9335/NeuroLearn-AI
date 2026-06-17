import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nowepoiasehxhkebkqkf.supabase.co';
// Fallback to a dummy key if not set to prevent Supabase initialization error
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vd2Vwb2lhc2VoeGhlYmtxa2YiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNTk5NjgwMCwiZXhwIjoyMDQxNTcyODAwfQ.dummy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a file to the 'assignment-submissions' bucket in Supabase storage.
 * If VITE_SUPABASE_ANON_KEY is not defined in the environment, it falls back to
 * simulating the upload and returns a standard public URL structure.
 * 
 * @param {File} file - The file to upload
 * @param {string} folderPath - The storage path (institution_id/student_id/assignment_id/filename)
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadToSupabase = async (file, folderPath) => {
  // If the developer hasn't configured the environment variable, simulate the upload gracefully
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn("VITE_SUPABASE_ANON_KEY is not set. Simulating file upload to Supabase storage...");
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency
    return `${supabaseUrl}/storage/v1/object/public/assignment-submissions/${folderPath}`;
  }

  const { data, error } = await supabase.storage
    .from('assignment-submissions')
    .upload(folderPath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error("Supabase Storage error:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('assignment-submissions')
    .getPublicUrl(folderPath);

  return publicUrlData.publicUrl;
};
