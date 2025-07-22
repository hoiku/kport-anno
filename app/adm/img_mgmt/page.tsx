'use client'

import UploadImg from '@/components/adm/uploadImg'

export default function AdminImageManagerPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">🗂️ 이미지 관리</h1>
      <UploadImg />
      {/* 여기 아래에 나중에 imageGallery도 추가 */}
    </main>
  )
}
