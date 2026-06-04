import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#d7ffb8] text-[#58CC02] font-extrabold text-sm px-4 py-2 rounded-full mb-6 uppercase tracking-wide">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Smart Flashcard Learning
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-gray-800 leading-tight mb-6">
            The fun way to<br /><span className="text-[#58CC02]">learn anything!</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 font-semibold">
            Build flashcard decks, study with spaced repetition, and level up your knowledge. It's effective, fun, and 100% free.
          </p>

          {currentUser ? (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/decks" className="btn-duo btn-duo-green text-lg px-10 py-4">
                GO TO MY DECKS
              </Link>
              <Link to="/dashboard" className="btn-duo btn-duo-ghost text-sm px-6 py-3">
                View Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/login" className="btn-duo btn-duo-green text-lg px-10 py-4">
                GET STARTED FREE
              </Link>
              <Link to="/login" className="btn-duo btn-duo-ghost text-sm px-6 py-3">
                I ALREADY HAVE AN ACCOUNT
              </Link>
            </div>
          )}
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Create Decks */}
            <div className="bg-white rounded-2xl border-2 border-b-4 bg-[#d7ffb8] border-[#58CC02] p-6">
              <div className="w-16 h-16 rounded-2xl bg-[#d7ffb8] flex items-center justify-center mb-4" style={{ animation: 'float 3s ease-in-out infinite' }}>
                <svg className="w-9 h-9 text-[#58CC02]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                  <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
                  <line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Create Decks</h3>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed">Build and organize flashcard decks by any subject. Add hints, explanations, and more.</p>
            </div>

            {/* Spaced Repetition */}
            <div className="bg-white rounded-2xl border-2 border-b-4 bg-[#ddf4ff] border-[#1cb0f6] p-6">
              <div className="w-16 h-16 rounded-2xl bg-[#ddf4ff] flex items-center justify-center mb-4" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1s' }}>
                <svg className="w-9 h-9 text-[#1cb0f6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.01M16 12h.01M8 12h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Spaced Repetition</h3>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed">Our smart algorithm shows cards at just the right time so nothing slips through the cracks.</p>
            </div>

            {/* Track Progress */}
            <div className="bg-white rounded-2xl border-2 border-b-4 bg-[#fff3d6] border-[#ff9600] p-6">
              <div className="w-16 h-16 rounded-2xl bg-[#fff3d6] flex items-center justify-center mb-4" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '2s' }}>
                <svg className="w-9 h-9 text-[#ff9600]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-2">Track Progress</h3>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed">See your streak, mastery rates, and study stats. Stay motivated and keep improving!</p>
            </div>
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
            @keyframes wave {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(20deg); }
              75% { transform: rotate(-10deg); }
            }
          `}</style>
        </section>

        {/* Welcome Back Banner */}
        {currentUser && (
          <section className="max-w-5xl mx-auto px-6 pb-20">
            <div className="bg-[#58CC02] rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white font-black text-lg mb-0.5">
                  Welcome back, {currentUser.displayName || 'there'}! <span style={{ display: 'inline-block', animation: 'wave 1.5s ease-in-out infinite' }}>👋</span>
                </p>
                <p className="text-[#d7ffb8] font-bold text-sm">Pick up where you left off.</p>
              </div>
              <Link to="/decks" className="btn-duo bg-white text-[#58CC02] font-extrabold border-bottom-color: #e5e5e5 px-6 py-3 rounded-2xl text-sm hover:bg-[#f7f7f7] transition border-b-4 border-[#e5e5e5]">
                CONTINUE STUDYING
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t-2 border-[#e5e5e5] py-8 text-center text-sm text-gray-400 font-bold bg-white">
        &copy; {new Date().getFullYear()} CardSparks
      </footer>
    </div>
  );
}
