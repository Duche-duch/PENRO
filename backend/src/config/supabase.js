import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ override: true });
// dotenv override keeps backend/.env authoritative during dev restarts.

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — API database calls will fail until set in .env'
  );
}

if (serviceKey && !serviceKey.startsWith('eyJ')) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY looks malformed (JWTs usually start with "eyJ"). Check backend/.env.'
  );
}

/** Server-side client (service role; keep key only on the backend). */
export const supabase = createClient(url || '', serviceKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});
