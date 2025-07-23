'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { createClient  } from '@/lib/supabase/client'

export default function UploadImg() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const supabase = createClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `public/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('img')
      .upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
    } else {
      const { data } = supabase.storage.from('img').getPublicUrl(filePath)
      setImageUrl(data.publicUrl)
      console.log('✅ Uploaded URL:', data.publicUrl)
    }

    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900 rounded-xl w-full max-w-md border border-zinc-700">
      <label className="text-white font-semibold">Upload an Image</label>

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
