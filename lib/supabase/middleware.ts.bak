import { authMiddleware } from "@supabase/auth-helpers-nextjs";

// 인증이 필요한 경로를 지정
export const config = {
  matcher: [
    '/app/adm/:path*',   // 관리자 페이지 전용
    '/app/user/:path*',  // 사용자 페이지 전용
  ],
};

// 인증되지 않은 사용자는 자동으로 이 경로로 리다이렉트
export default authMiddleware({
  redirectTo: '/auth/login',
});
