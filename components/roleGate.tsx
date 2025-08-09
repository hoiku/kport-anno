'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminCta from './adminCta'
import UserCta from './userCta'
import GuestCta from './guestCta'

export default function RoleGate() {
  const supabase = createClient()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setRole('guest')

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile?.role ?? 'user')
    }

    fetchUserRole()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          setRole('guest')
        } else if (event === 'SIGNED_IN') {
          fetchUserRole()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  if (!role) return <p>로딩 중...</p>
  if (role === 'admin') return <AdminCta />
  if (role === 'user') return <UserCta />
  return <GuestCta />
}
