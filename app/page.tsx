import Navbar from '@/components/navbar'
import RoleGate from '@/components/roleGate'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex justify-center p-8">
        <RoleGate />
      </div>
    </main>
  )
}
