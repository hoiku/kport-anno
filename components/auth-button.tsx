'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Image from 'next/image'

export const AuthButton = () => {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          setRole(data.role)
        }
      }
    }

    fetchUser()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const userLabel = !user
    ? '익명의 사용자님'
    : role === 'admin'
    ? `관리자 ${user.email?.split('@')[0]}님`
    : `${user.email?.split('@')[0]}님`

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{userLabel}</span>
      {!user ? (
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition"
        >
          <Image
            src="/google-logo.svg"
            alt="Google logo"
            width={18}
            height={18}
            className="inline-block"
          />
          Google로 로그인
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1 rounded bg-muted border hover:bg-muted/70 transition"
        >
          로그아웃
        </button>
      )}
    </div>
  )
}
