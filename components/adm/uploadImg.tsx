'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function UploadImg() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) {
      alert('파일을 선택하세요.')
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/upload-handler', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const message = await res.text()
      alert(message || '업로드 실패')
    } else {
      alert('업로드 성공')
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
