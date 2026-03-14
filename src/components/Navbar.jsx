import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

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
    'text-sm font-medium transition-colors duration-150 ' +
    (active(path) ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900');

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="text-base font-bold text-gray-900 tracking-tight">
            CardSparks
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={linkCls('/')}>Home</Link>
            {currentUser && (
              <>
                <Link to="/decks" className={linkCls('/decks')}>My Decks</Link>
                <Link to="/profile" className={linkCls('/profile')}>Profile</Link>
              </>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="text-sm text-gray-400">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/login"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-500 hover:text-gray-900"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-4">
            <Link to="/" className={linkCls('/')} onClick={() => setOpen(false)}>Home</Link>
            {currentUser && (
              <>
                <Link to="/decks" className={linkCls('/decks')} onClick={() => setOpen(false)}>My Decks</Link>
                <Link to="/profile" className={linkCls('/profile')} onClick={() => setOpen(false)}>Profile</Link>
              </>
            )}
            {currentUser ? (
              <button onClick={handleLogout} className="text-sm font-medium text-left text-red-500 hover:text-red-700">
                Log out
              </button>
            ) : (
              <Link to="/login" className="text-sm font-semibold text-indigo-600" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
