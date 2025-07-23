// app/api/image-meta/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const supabase = createServerClient({ cookies })
  const body = await req.json()
  const { path, url, title, description, uploader } = body

  const { error } = await supabase
    .from('images')
    .insert([{ path, url, title, description, uploader }])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: '메타데이터 저장 성공' })
}
