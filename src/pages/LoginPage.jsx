import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup, loginWithGoogle, resetPassword, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password);
        toast.success('Account created!');
      } else {
        await login(email, password);
        toast.success('Welcome back!');
      }
      navigate('/');
    } catch (error) {
      const msg = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password must be at least 6 characters',
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
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success('Password reset email sent!');
      setShowReset(false);
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Toaster position="top-center" />

        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M12 4v16M2 12h20" />
            </svg>
            <span className="text-xl font-bold text-gray-800">CardSparks</span>
          </div>
        </div>

        {/* Centered Card */}
        <div className="flex-1 flex items-center justify-center px-4 -mt-16">
          <div className="w-full max-w-md">
            <p className="text-sm text-blue-500 mb-1">Reset your password</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Forgot password</h1>

            <form onSubmit={handleReset} className="space-y-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors bg-transparent border-none"
              >
                ← Back to login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />

      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M12 4v16M2 12h20" />
          </svg>
          <span className="text-xl font-bold text-gray-800">CardSparks</span>
        </div>
      </div>

      {/* Centered Card */}
      <div className="flex-1 flex items-center justify-center px-4 -mt-16">
        <div className="w-full max-w-md">
          <p className="text-sm text-blue-500 mb-1">Please enter your details</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            />

            {/* Password */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            />

            {/* Remember Me & Forgot Password */}
            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  Remember for 30 days
                </label>
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
                  className="text-sm text-blue-500 hover:text-blue-600 font-medium bg-transparent border-none cursor-pointer"
                >
                  Forgot password
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign up' : 'Sign in')}
            </button>
          </form>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Toggle Sign Up / Sign In */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-500 hover:text-blue-600 font-medium bg-transparent border-none cursor-pointer"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
