import { protectRoutes } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await protectRoutes(request);
}

// 보호할 경로 지정 (관리자, 사용자 페이지 등)
export const config = {
  matcher: [
    '/app/adm/:path*',
    '/app/user/:path*',
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],  

};
