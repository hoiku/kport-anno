import AdminCta from './adminCta'
import UserCta from './userCta'
import GuestCta from './guestCta'
import { getUserRole } from '@/lib/supabase/getUserRole'

export default async function RoleGate() {
  const role = await getUserRole()

  if (role === 'admin') return <AdminCta />
  if (role === 'user') return <UserCta />
  return <GuestCta />
}
