import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // ✅ 서버 클라이언트 import

export async function POST(req: Request) {
  const supabase = createClient(); // ✅ 쿠키 기반 인증 포함됨

  const { url, title, description } = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser(); // ✅ 인증된 사용자

  if (!user) {
    return NextResponse.json({ error: "인증되지 않음" }, { status: 401 });
  }

  const { error } = await supabase.from("images").insert([
    {
      image_url: url,
      title,
      description,
      user_id: user.id, // ✅ 인증된 user.id 삽입해야 RLS 통과
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "메타데이터 저장 성공" });
}
