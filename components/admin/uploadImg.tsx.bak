'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/supabase-js'

export default function UploadImageSection() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const currentUser = data.user
      setUser(currentUser)
      if (currentUser?.email === '도도 관리자 이메일') {
        setIsAdmin(true)
      }
    })
  }, [])

  if (!isAdmin) return null // 일반 유저는 아무것도 안 보임

  return (
    <div className="border p-4 rounded shadow">
      <h2 className="font-semibold mb-2">📤 관리자 전용 이미지 업로드</h2>
      {/* 여기에 업로드 폼 추가 */}
      <input type="file" />
      <button className="ml-2 px-4 py-1 bg-blue-600 text-white rounded">
        업로드
      </button>
    </div>
  )
}
