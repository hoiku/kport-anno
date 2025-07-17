'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/supabase-js'

export function NavBar() {
  const { setTheme } = useTheme()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <nav className="w-full border-b border-gray-200 dark:border-zinc-700 py-4 px-6 bg-white dark:bg-zinc-900 shadow-sm flex justify-between items-center">
      <Link href="/" className="text-lg font-bold">🎨 Image Annotation</Link>

      <div className="flex items-center gap-4">
        <button onClick={() => setTheme('dark')}>🌙</button>
        <button onClick={() => setTheme('light')}>☀️</button>

        {!user ? (
          <button onClick={handleLogin} className="text-sm px-4 py-2 bg-blue-600 text-white rounded">
            로그인
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span>{user.email}</span>
            <button onClick={handleLogout} className="border rounded px-3 py-1">로그아웃</button>
          </div>
        )}
      </div>
    </nav>
  )
}
