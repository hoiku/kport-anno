import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )

  const body = await req.json()
  const { path, url, title, description, uploader } = body

  const { error } = await supabase
  .from('images')
  .insert([{
    image_url: url,        // 매핑 변경
    user_id: uploader,     // 매핑 변경
    title,
    description,
    // path도 별도 필드 만들거나 metadata에 넣을 수 있음
  }])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: '메타데이터 저장 성공' })
}
