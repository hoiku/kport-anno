import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ✅ 전역 인스턴스를 재사용
export const supabase =
  globalThis.supabase ||
  createClient(supabaseUrl, supabaseAnonKey)

if (typeof window !== 'undefined') {
  globalThis.supabase = supabase
}
