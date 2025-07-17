'use client'

import { NavBar } from '@/components/navBar'
import { Hero } from '@/components/hero'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-zinc-900 dark:text-white flex flex-col">
      <NavBar />
      <Hero />
      <footer className="text-center text-xs text-gray-400 dark:text-zinc-500 py-4 border-t">
        Powered by Supabase + Next.js
      </footer>
    </main>
  )
}
