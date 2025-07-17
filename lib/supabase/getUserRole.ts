import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getUserRole(): Promise<'admin' | 'user' | 'guest'> {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 'guest'

  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (data?.role === 'admin') return 'admin'
  return 'user'
}
