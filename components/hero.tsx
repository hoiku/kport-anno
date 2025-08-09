'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Hero() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    fetchUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold mb-4">환영합니다 🙌</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        이미지 주석 작업을 위한 관리자 페이지입니다.
      </p>
      {user && (
        <Link href="/dashboard">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            대시보드 바로가기
          </button>
        </Link>
      )}
    </section>
  )
}
