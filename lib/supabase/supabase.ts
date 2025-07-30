import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// ✅ 타입 선언 추가
declare global {
  var supabase: ReturnType<typeof createClient> | undefined
}

// ✅ 전역 인스턴스 재사용
export const supabase =
  globalThis.supabase ||
  createClient(supabaseUrl, supabaseAnonKey)

if (typeof window !== 'undefined') {
  globalThis.supabase = supabase
}
