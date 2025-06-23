import React from 'react'
import ReactDOM from 'react-dom/client'
import AuthWrapper from './AuthWrapper.jsx'
import LogoutButton from './LogoutButton.jsx'

function LoginRoot() {
  return (
    <AuthWrapper>
      <LogoutButton />
    </AuthWrapper>
  )
}

ReactDOM.createRoot(document.getElementById('login-root')).render(
  <React.StrictMode>
    <LoginRoot />
  </React.StrictMode>
)
