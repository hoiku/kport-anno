'use client'

import Link from 'next/link'

export default function AdminCta() {
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">관리자님, 환영합니다.</h2>
      <p className="text-gray-500">관리자 전용 기능에 접근할 수 있습니다.</p>
      <Link
        href="/protected/admin/img_mgmt"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        이미지 관리
      </Link>
    </div>
  )
}
