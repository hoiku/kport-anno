import React from 'react'
import { supabase } from './supabaseClient.js'

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      console.log('Logged out')
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      window.location.href = '/'
    }
  }

  return (
    <button onClick={handleLogout}>Logout</button>
  )
}
