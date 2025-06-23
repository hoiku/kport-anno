import React from 'react'
import ReactDOM from 'react-dom/client'
import AuthWrapper from './AuthWrapper.jsx'
import LogoutButton from './LogoutButton.jsx'

function LoginRoot() {
  // AuthWrapper will display the Google login button when the user is not
  // authenticated. Once logged in, it reveals the main UI and any children
  // passed to it. Here we simply render the logout button as that child.
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
