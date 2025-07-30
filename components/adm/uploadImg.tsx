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
    if (!file) {
      console.log('⛔ No file selected')
      return
    }

    setUploading(true)
    setError(null)

    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${fileName}`

    console.log('📤 Starting upload to Supabase Storage')
    console.log('📝 File path:', filePath)

    // ✅ 세션 먼저 확인
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    console.log('🧪 Session Check:', { sessionData, sessionError })

    // 🔁 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('img')
      .upload(filePath, file)

    if (uploadError) {
      console.error('❌ Upload Error:', uploadError)
      setError(`업로드 실패: ${uploadError.message}`)
      setUploading(false)
      return
    }

    console.log('✅ Upload to storage successful')

    // 🧾 2. Get public URL
    const { data: publicData } = supabase.storage
      .from('img')
      .getPublicUrl(filePath)

    if (!publicData?.publicUrl) {
      console.error('❌ Public URL generation failed')
      setError('공개 URL 생성 실패')
      setUploading(false)
      return
    }

    console.log('🌐 Public URL:', publicData.publicUrl)
    setImageUrl(publicData.publicUrl)

    // 👤 3. Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    console.log('🔐 Auth result:', { userData, userError })

    if (userError || !userData?.user) {
      console.error('❌ User not authenticated')
      setError('로그인이 필요합니다')
      setUploading(false)
      return
    }

    // 🧩 4. Insert metadata to DB
    console.log('📥 Inserting metadata to DB...')

    const { error: insertError } = await supabase
      .from('images')
      .insert({
        user_id: userData.user.id,
        path: filePath,
        url: publicData.publicUrl,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('❌ DB Insert Error:', insertError)
      setError(`DB 저장 실패: ${insertError.message}`)
      setUploading(false)
      return
    }

    console.log('✅ Metadata insert successful')
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
