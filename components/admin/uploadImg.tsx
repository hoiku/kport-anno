'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@/lib/hooks/useUser' // 도도 커스텀 훅 경로 반영

export default function UploadImg() {
  const supabase = createClientComponentClient()
  const user = useUser()

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file || user?.user_metadata?.role !== 'admin') {
      alert('관리자만 업로드할 수 있습니다.')
      return
    }

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `images/${fileName}`

    // 1. Supabase Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from('your_bucket_name') // ← 실제 Supabase 버킷 이름으로 교체
      .upload(filePath, file)

    if (uploadError) {
      console.error('업로드 실패:', uploadError.message)
      alert('이미지 업로드에 실패했습니다.')
      setUploading(false)
      return
    }

    // 2. Supabase DB에 메타데이터 저장
    const { error: insertError } = await supabase.from('images').insert({
      url: filePath,
      uploaded_by: user.id,
    })

    if (insertError) {
      console.error('DB 삽입 실패:', insertError.message)
      alert('DB 저장에 실패했습니다.')
    } else {
      alert('업로드 성공!')
      setFile(null)
    }

    setUploading(false)
  }

  return (
    <div className="p-4 border rounded shadow w-full max-w-md mx-auto bg-white dark:bg-zinc-900">
      <h2 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">이미지 업로드</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? '업로드 중...' : '업로드'}
      </button>
    </div>
  )
}
