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
        get: (name: string) => {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        set: () => {},
        remove: () => {},
      },
    }
  )

  // 👇 인증된 사용자 가져오기
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user || authError) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  const body = await req.json()
  const { url, title, description } = body

  const { error } = await supabase
    .from('images')
    .insert([
      {
        image_url: url,
        user_id: user.id, // ✅ 이게 핵심!
        title,
        description,
      },
    ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: '메타데이터 저장 성공' })
}
