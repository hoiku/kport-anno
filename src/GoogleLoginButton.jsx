import React, { useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import { ensureProfileExists, getUserRole } from './authHelpers.js'

export default function GoogleLoginButton() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) {
      console.warn('Login failed', error)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.warn('Failed to get user', error)
        return
      }
      if (user) {
        try {
          await ensureProfileExists(user)
          const role = await getUserRole(user.id)
          console.log('Logged in as', user.email, 'with role', role)
        } catch (e) {
          console.warn('Post login error', e)
        }
      }
    }

    checkUser()
  }, [])

  return (
    <button onClick={handleLogin}>Sign in with Google</button>
  )
}
