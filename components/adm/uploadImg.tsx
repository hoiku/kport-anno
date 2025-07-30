'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase/supabase'

export default function UploadImg() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('img')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: publicData } = supabase.storage.from('img').getPublicUrl(filePath)

    if (!publicData?.publicUrl) {
      setError('공개 URL 생성 실패')
      setUploading(false)
      return
    }

    setImageUrl(publicData.publicUrl)
    console.log('✅ Uploaded URL:', publicData.publicUrl)

    // 🔐 사용자 인증 정보 가져오기
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      setError('로그인이 필요합니다')
      setUploading(false)
      return
    }

    // 📝 Supabase DB에 이미지 메타데이터 삽입
    const { error: insertError } = await supabase.from('images').insert({
      user_id: userData.user.id,
      path: filePath,
      url: publicData.publicUrl,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      setError(`DB 저장 실패: ${insertError.message}`)
    } else {
      console.log('✅ DB에 메타데이터 저장 완료')
    }

    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900 rounded-xl w-full max-w-md border border-zinc-700">
      <label className="text-white font-semibold">📤 Upload an Image</label>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="text-white"
      />

      {uploading && <p className="text-yellow-400">Uploading...</p>}
      {error && <p className="text-red-400">❌ {error}</p>}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded"
          className="rounded mt-2 max-h-64 object-contain border border-zinc-700"
        />
      )}
    </div>
  )
}
