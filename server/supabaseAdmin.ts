import { createClient } from '@supabase/supabase-js'
import { getRequiredEnv } from './auth.ts'

export function createSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('Missing required environment variable: SUPABASE_URL or VITE_SUPABASE_URL')
  }

  return createClient(supabaseUrl, getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
