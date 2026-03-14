import { useAuth } from './AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function SignInPage() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  // If already signed in, redirect home
  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  async function handleSignIn() {
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error('Sign-in error:', err)
    }
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand">Aminaa Studio</div>
      </header>

      <main className="signin-main">
        <div className="signin-card">
          <h1>Welcome back</h1>
          <p>Sign in to continue to Aminaa Studio.</p>
          <button className="google-btn" onClick={handleSignIn}>
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </main>
    </div>
  )
}
