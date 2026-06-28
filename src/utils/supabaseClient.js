import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

/**
 * Uploads a logo file to the 'institution-branding' bucket in Supabase storage.
 * If VITE_SUPABASE_ANON_KEY is not defined, it simulates the upload.
 *
 * @param {File} file - The logo file to upload
 * @param {string} folderPath - The storage path (institution_<id>/logo.png)
 * @returns {Promise<string>} The public URL of the uploaded logo
 */
export const uploadLogoToSupabase = async (file, folderPath) => {
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn("VITE_SUPABASE_ANON_KEY is not set. Simulating file upload to Supabase storage...");
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency
    return `${supabaseUrl}/storage/v1/object/public/institution-branding/${folderPath}`;
  }

  // Upload or overwrite the logo
  const { data, error } = await supabase.storage
    .from('institution-branding')
    .upload(folderPath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error("Supabase Storage error:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('institution-branding')
    .getPublicUrl(folderPath);

  return publicUrlData.publicUrl;
};
