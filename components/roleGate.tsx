'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AdminCta from './adminCta'
import UserCta from './userCta'
import GuestCta from './guestCta'

export default function RoleGate() {
  const supabase = createClientComponentClient()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user
      if (!user) return setRole('guest')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile?.role ?? 'user')
    })
  }, [])

  if (!role) return <p>로딩 중...</p>
  if (role === 'admin') return <AdminCta />
  if (role === 'user') return <UserCta />
  return <GuestCta />
}
