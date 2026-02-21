import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client — uses the service role key.
 * NEVER expose this on the client side. Only use in server-side code (API routes / tools).
 *
 * Bypasses Row Level Security so tools can read/write on behalf of any user.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
