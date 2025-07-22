import { protectRoutes } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 로그인 페이지는 인증 없이 접근 가능
  if (pathname.startsWith('/auth/login')) {
    return
  }

  return await protectRoutes(request)
}

export const config = {
  matcher: [
    // 보호 대상 경로
    '/app/adm/:path*',
    '/app/user/:path*',

    // Next.js 내부 파일, 이미지, favicon 등 제외
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
