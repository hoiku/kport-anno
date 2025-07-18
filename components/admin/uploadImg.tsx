'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'

export default function UploadImg() {
  const supabase = createClientComponentClient()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file || role !== 'admin') return

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `images/${fileName}`

    // 1. Supabase Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from('your_bucket_name') // 실제 사용 중인 Storage bucket 이름으로 변경
      .upload(filePath, file)

    if (uploadError) {
      console.error('업로드 실패:', uploadError)
      setUploading(false)
      return
    }

    // 2. Supabase 테이블에 메타데이터 저장
    const { error: insertError } = await supabase.from('images').insert({
      url: filePath,
      uploaded_by: user.id,
    })

    if (insertError) {
      console.error('DB 삽입 실패:', insertError)
    } else {
      alert('업로드 성공!')
    }

    setUploading(false)
    setFile(null)
  }

  return (
    <div className="p-4 border rounded shadow w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">이미지 업로드</h2>
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
