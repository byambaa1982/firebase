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

  useEffect(() => {
    if (currentUser) navigate('/');
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
    if (!email) { toast.error('Please enter your email address'); return; }
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

  const inputCls = "w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20 bg-white font-semibold";

  if (showReset) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center px-4">
        <Toaster position="top-center" />
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 justify-center">
            <div className="w-10 h-10 bg-[#58CC02] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-black text-gray-800">CardSparks</span>
          </div>

          <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8 shadow-sm">
            <h1 className="text-2xl font-black text-gray-800 mb-1 text-center">Forgot password?</h1>
            <p className="text-sm text-gray-400 text-center mb-6 font-bold">No worries, we'll send you a reset link</p>

            <form onSubmit={handleReset} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className={inputCls} />
              <button type="submit" disabled={loading} className="btn-duo btn-duo-green w-full py-3.5 text-base">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <button type="button" onClick={() => setShowReset(false)} className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition bg-transparent border-none">
                &larr; Back to login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-10 h-10 bg-[#58CC02] rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-black text-gray-800">CardSparks</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#e5e5e5] p-8 shadow-sm">
          <h1 className="text-2xl font-black text-gray-800 mb-1 text-center">
            {isSignUp ? 'Create your profile' : 'Welcome back!'}
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6 font-bold">
            {isSignUp ? 'Start your learning journey' : 'Log in to keep learning'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className={inputCls} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} className={inputCls} />

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 font-bold">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-[#58CC02]" />
                  Remember me
                </label>
                <button type="button" onClick={() => setShowReset(true)} className="text-sm text-[#1cb0f6] hover:text-[#1899d6] font-bold bg-transparent border-none cursor-pointer">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-duo btn-duo-green w-full py-3.5 text-base">
              {loading ? (isSignUp ? 'Creating...' : 'Logging in...') : (isSignUp ? 'CREATE ACCOUNT' : 'LOG IN')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-[#e5e5e5]"></div></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-bold text-gray-400 uppercase">or</span></div>
          </div>

          <button type="button" onClick={handleGoogle} disabled={loading} className="btn-duo btn-duo-ghost w-full py-3 text-sm flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-400 mt-6 font-bold">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-[#1cb0f6] hover:text-[#1899d6] font-extrabold bg-transparent border-none cursor-pointer">
              {isSignUp ? 'LOG IN' : 'SIGN UP'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
