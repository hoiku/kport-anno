import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const cookieStore = nextCookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {}, // 서버 환경에선 생략
        remove() {}, // 서버 환경에선 생략
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
