import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const cookieStore = await nextCookies() // ✅ await 추가 (핵심 고침!)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          const cookie = cookieStore.get(name) // ✅ 에러 안 남
          return cookie?.value
        },
        set: () => {},
        remove: () => {},
      },
    }
  )

  const body = await req.json()
  const { url, title, description, uploader } = body

  const { error } = await supabase
    .from('images')
    .insert([
      {
        image_url: url,
        user_id: uploader,
        title,
        description,
      },
    ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: '메타데이터 저장 성공' })
}
