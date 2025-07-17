'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 세션 확인 (자동 이동 ❌)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
      } catch (error) {
        console.error('세션 확인 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  // Google 로그인
  const handleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}`,
        },
      })
    } catch (error) {
      console.error('로그인 오류:', error)
      alert('Google 로그인에 실패했습니다.')
    }
  }

  // 대시보드로 수동 이동
  const goToDashboard = () => {
    router.push('/dashboard')
  }

  if (loading) return <p className="text-center">로그인 상태 확인 중...</p>

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg text-center space-y-6">
        <h1 className="text-2xl font-bold">👋 안녕하세요!</h1>

        {!user ? (
          <button
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 w-full bg-white text-[#3c4043] border border-[#dadce0] rounded-md py-2 px-4 text-sm font-medium shadow-sm hover:shadow-md"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google Logo"
              className="w-5 h-5"
            />
            <span>Sign in with Google</span>
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700 text-sm">
              ✅ {user.email} 님으로 로그인되었습니다.
            </p>
            <button
              onClick={goToDashboard}
              className="w-full bg-blue-600 text-white rounded-md py-2 px-4 text-sm font-medium shadow hover:bg-blue-700"
            >
              대시보드 확인
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
