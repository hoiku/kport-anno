import Link from 'next/link'
import ThemeSwitcher from './themeSwitcher'
import AuthButton from './authButton'

export default function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center p-4 border-b">
      <Link href="/" className="font-bold text-lg">
        🖼️ 주석 플랫폼
      </Link>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <AuthButton />
      </div>
    </nav>
  )
}
