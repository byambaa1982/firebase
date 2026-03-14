import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { signup, login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password, displayName);
        toast.success('Account created!');
      } else {
        await login(email, password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (error) {
      const msg = {
        'auth/email-already-in-use': 'Email already in use',
        'auth/invalid-email': 'Invalid email address',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
      }[error.code] || error.message || 'Authentication failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email first'); return; }
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success('Reset email sent!');
      setShowReset(false);
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">CardSparks</span>
        </Link>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
          {showReset ? (
            <>
              <h1 className="text-white text-xl font-bold mb-1">Reset password</h1>
              <p className="text-white/40 text-sm mb-8">We'll send a reset link to your email.</p>

              <form onSubmit={handleReset} className="space-y-4">
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <button onClick={() => setShowReset(false)} className="mt-4 w-full text-center text-sm text-white/40 hover:text-white transition-colors">
                ← Back to sign in
              </button>
            </>
          ) : (
            <>
              <h1 className="text-white text-xl font-bold mb-1">
                {isSignUp ? 'Create account' : 'Welcome back'}
              </h1>
              <p className="text-white/40 text-sm mb-8">
                {isSignUp ? 'Start learning for free.' : 'Sign in to your account.'}
              </p>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-white font-medium py-2.5 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 mb-6"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-white/25 text-xs">or</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <Field label="Name" type="text" value={displayName} onChange={setDisplayName} placeholder="Your name" />
                )}
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-white/50">Password</label>
                    {!isSignUp && (
                      <button type="button" onClick={() => setShowReset(true)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className={inputClass}
                  />
                  {isSignUp && <p className="text-xs text-white/25 mt-1.5">At least 6 characters</p>}
                </div>

                <button type="submit" disabled={loading} className={primaryBtn + ' !mt-6'}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {isSignUp ? 'Creating…' : 'Signing in…'}
                    </span>
                  ) : isSignUp ? 'Create account' : 'Sign in'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Toggle */}
        {!showReset && (
          <p className="text-center text-sm text-white/35 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

const inputClass =
  'w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200';

const primaryBtn =
  'w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-200';

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
