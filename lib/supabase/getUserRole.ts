import { createClient } from '@/lib/supabase/server'

export async function getUserRole(): Promise<'admin' | 'user' | 'guest'> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 'guest'

  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (data?.role === 'admin') return 'admin'
  return 'user'
}
