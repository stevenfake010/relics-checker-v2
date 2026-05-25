import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env as Record<string, string> | undefined

const supabaseUrl = env?.VITE_SUPABASE_URL
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY

const isPlaceholder = (v: string | undefined) =>
  !v || v.startsWith('placeholder') || v === 'https://placeholder.supabase.co'

export type Database = {
  public: {
    Tables: {
      checkins: {
        Row: { id: number; user_id: string; relic_id: number; checked_at: string }
        Insert: { user_id: string; relic_id: number }
        Delete: { id: number }
      }
    }
  }
}

// If env vars are missing or placeholder, export null client
// so the app can still run without Supabase
let _supabase: SupabaseClient<Database> | null = null

if (!isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)) {
  _supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!)
}

export const supabase = _supabase

export const hasSupabase = _supabase !== null
