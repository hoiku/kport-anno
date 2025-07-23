'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient()

export default function UploadImage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleUpload = async () => {
    if (!file) return alert('파일을 선택하세요.')

    const filePath = `uploads/${Date.now()}_${file.name}`

    const { error } = await supabase.storage
      .from('img')
      .upload(filePath, file)

    if (error) return alert('업로드 실패: ' + error.message)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    // 서버에 메타데이터 저장 요청
    await fetch('/api/img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: filePath,
        url: supabase.storage.from('img').getPublicUrl(filePath).data.publicUrl,
        title,
        description,
        uploader: user?.id,
      }),
    })

    alert('성공적으로 업로드 완료')
    setFile(null)
    setTitle('')
    setDescription('')
  }

  return (
    <div className="space-y-2">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="설명" value={description} onChange={(e) => setDescription(e.target.value)} />
      <button onClick={handleUpload}>업로드</button>
    </div>
  )
}
