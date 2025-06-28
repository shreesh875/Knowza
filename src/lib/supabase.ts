import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase Configuration Check:')
console.log('URL:', supabaseUrl ? '✅ Present' : '❌ Missing')
console.log('Anon Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing')

let supabase: ReturnType<typeof createClient<Database>>

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
  console.error('📋 Please check your .env file and ensure these variables are set:')
  console.error('VITE_SUPABASE_URL=your_supabase_project_url')
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  
  // Provide fallback values to prevent app crash
  const fallbackUrl = 'https://placeholder.supabase.co'
  const fallbackKey = 'placeholder-key'
  
  console.warn('⚠️ Using fallback Supabase configuration - app will not function properly')
  
  supabase = createClient<Database>(fallbackUrl, fallbackKey)
} else {
  console.log('✅ Supabase configuration looks good!')
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export { supabase }