import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const cookieStore = nextCookies()  // 이건 비동기 아님

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        set: () => {},  // SSR 환경에서는 사용 안 함
        remove: () => {}, // SSR 환경에서는 사용 안 함
      },
    }
  )

  const body = await req.json()
  const { url, title, description, uploader } = body

  const { error } = await supabase
    .from('images')
    .insert([{
      image_url: url,
      user_id: uploader,
      title,
      description,
    }])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: '메타데이터 저장 성공' })
}
