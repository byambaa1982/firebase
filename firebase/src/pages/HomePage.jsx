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
            {[
              {
                icon: '??',
                color: 'bg-[#d7ffb8] border-[#58CC02]',
                title: 'Create Decks',
                desc: 'Build and organize flashcard decks by any subject. Add hints, explanations, and more.',
              },
              {
                icon: '??',
                color: 'bg-[#ddf4ff] border-[#1cb0f6]',
                title: 'Spaced Repetition',
                desc: 'Our smart algorithm shows cards at just the right time so nothing slips through the cracks.',
              },
              {
                icon: '??',
                color: 'bg-[#fff3d6] border-[#ff9600]',
                title: 'Track Progress',
                desc: 'See your streak, mastery rates, and study stats. Stay motivated and keep improving!',
              },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className={`bg-white rounded-2xl border-2 border-b-4 ${color} p-6`}>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-black text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 font-semibold leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Welcome Back Banner */}
        {currentUser && (
          <section className="max-w-5xl mx-auto px-6 pb-20">
            <div className="bg-[#58CC02] rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white font-black text-lg mb-0.5">
                  Welcome back, {currentUser.displayName || 'there'}! ??
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
