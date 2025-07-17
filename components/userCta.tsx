'use client'

export default function UserCta() {
  return (
    <div className="text-center space-y-2">
      <h2 className="text-xl font-semibold">👤 안녕하세요, 사용자님!</h2>
      <p className="text-sm text-muted-foreground">
        현재 열람 전용 권한으로 접속 중입니다.
      </p>
    </div>
  )
}
