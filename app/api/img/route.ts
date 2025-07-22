import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return new Response('로그인 필요', { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    return new Response('관리자만 업로드 가능', { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return new Response('파일 없음', { status: 400 })
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `images/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('img')
    .upload(filePath, file)

  if (uploadError) {
    return new Response(`업로드 실패: ${uploadError.message}`, { status: 500 })
  }

  const { error: insertError } = await supabase.from('images').insert({
    url: filePath,
    uploaded_by: session.user.id,
  })

  if (insertError) {
    return new Response(`DB 오류: ${insertError.message}`, { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
