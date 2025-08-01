
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { type NextRequest, NextResponse } from 'next/server';

export async function protectRoutes(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 세션 없으면 로그인 페이지로 리다이렉트
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response;
}
