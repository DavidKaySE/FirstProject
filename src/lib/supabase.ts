import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabaseTypes'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  console.error('Supabase Anon Key is missing')
}
if (!supabaseUrl) {
  console.error('Supabase URL is missing')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
