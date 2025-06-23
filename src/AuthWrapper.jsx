import React, { useEffect } from 'react'
import useAuthStatus from './useAuthStatus.js'
import GoogleLoginButton from './GoogleLoginButton.jsx'

export default function AuthWrapper({ children }) {
  const { user, loading } = useAuthStatus()

  useEffect(() => {
    // Clean up access_token hash that may remain after OAuth redirect
    if (window.location.hash && window.location.hash.includes('access_token')) {
      window.location.hash = ''
    }

    const container = document.getElementById('annotator-ui')
    if (!loading) {
      if (user) {
        container && container.classList.remove('hidden')
      } else {
        container && container.classList.add('hidden')
      }
    }
  }, [user, loading])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <GoogleLoginButton />
  }

  return <>{children}</>
}
