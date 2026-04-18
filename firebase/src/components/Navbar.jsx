import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserAnalytics } from '../services/analyticsService';
import { StreakBadge } from './StreakDisplay';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [streakInfo, setStreakInfo] = useState({ streak: 0, studiedToday: false });

  useEffect(() => {
    if (!currentUser) return;
    getUserAnalytics(currentUser.uid)
      .then(data => setStreakInfo({ streak: data.streak, studiedToday: data.studiedToday }))
      .catch(() => {});
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const active = (path) => location.pathname === path;

  const linkCls = (path) =>
    'text-sm font-extrabold tracking-wide uppercase transition-all duration-150 px-3 py-1.5 rounded-xl ' +
    (active(path)
      ? 'text-[#58CC02] bg-[#d7ffb8]'
      : 'text-gray-500 hover:text-[#58CC02] hover:bg-green-50');

  return (
    <nav className="bg-white border-b-2 border-[#e5e5e5] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#58CC02] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-black text-gray-800 tracking-tight">CardSparks</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={linkCls('/')}>Home</Link>
            {currentUser && (
              <>
                <Link to="/dashboard" className={linkCls('/dashboard')}>Dashboard</Link>
                <Link to="/decks" className={linkCls('/decks')}>Decks</Link>
                <Link to="/ai-generate" className={linkCls('/ai-generate')}>AI Generate</Link>
                <Link to="/adaptive-quiz" className={linkCls('/adaptive-quiz')}>Adaptive Quiz</Link>
                <Link to="/profile" className={linkCls('/profile')}>Profile</Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <StreakBadge streak={streakInfo.streak} studiedToday={streakInfo.studiedToday} />
                <span className="text-sm font-bold text-gray-400">{currentUser.displayName || currentUser.email}</span>
                <button onClick={handleLogout} className="btn-duo btn-duo-ghost text-sm px-4 py-2">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-duo btn-duo-ghost text-sm px-5 py-2.5">Sign in</Link>
                <Link to="/login" className="btn-duo btn-duo-green text-sm px-5 py-2.5">Get started</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-500" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t-2 border-[#e5e5e5] py-4 flex flex-col gap-2">
            <Link to="/" className={linkCls('/')} onClick={() => setOpen(false)}>Home</Link>
            {currentUser && (
              <>
                <Link to="/dashboard" className={linkCls('/dashboard')} onClick={() => setOpen(false)}>Dashboard</Link>
                <Link to="/decks" className={linkCls('/decks')} onClick={() => setOpen(false)}>Decks</Link>
                <Link to="/ai-generate" className={linkCls('/ai-generate')} onClick={() => setOpen(false)}>AI Generate</Link>
                <Link to="/adaptive-quiz" className={linkCls('/adaptive-quiz')} onClick={() => setOpen(false)}>Adaptive Quiz</Link>
                <Link to="/profile" className={linkCls('/profile')} onClick={() => setOpen(false)}>Profile</Link>
              </>
            )}
            {currentUser ? (
              <button onClick={handleLogout} className="text-sm font-bold text-left text-[#ff4b4b] px-3 py-1.5">Log out</button>
            ) : (
              <Link to="/login" className="text-sm font-bold text-[#58CC02] px-3 py-1.5" onClick={() => setOpen(false)}>Sign in</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
