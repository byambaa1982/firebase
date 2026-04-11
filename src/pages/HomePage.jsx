import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <p className="text-sm font-semibold text-indigo-600 tracking-widest uppercase mb-5">
            Smart flashcard learning
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Learn faster.<br />Remember longer.
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            CardSparks helps you build flashcard decks, study with spaced repetition,
            and track your progress — all in one clean place.
          </p>

          {currentUser ? (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/decks"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Go to My Decks
              </Link>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                View profile →
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Get started free
              </Link>
              <Link
                to="/login"
                className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Already have an account? Sign in →
              </Link>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-6">
          <hr className="border-gray-100" />
        </div>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
          {[
            {
              label: 'Create',
              title: 'Build your own decks',
              desc: 'Organize cards by subject, tag them by category, and edit anytime. It takes seconds to get started.',
            },
            {
              label: 'Study',
              title: 'Spaced repetition',
              desc: 'Our algorithm shows you cards exactly when you need to review them — so nothing slips through.',
            },
            {
              label: 'Track',
              title: 'Monitor your progress',
              desc: 'Study streaks, mastery rates, and session history keep you accountable and motivated.',
            },
          ].map(({ label, title, desc }) => (
            <div key={title}>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">{label}</p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>

        {/* Welcome back banner for logged-in users */}
        {currentUser && (
          <section className="max-w-5xl mx-auto px-6 pb-20">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-700 mb-0.5">
                  Welcome back, {currentUser.displayName || 'there'}!
                </p>
                <p className="text-sm text-gray-500">Pick up where you left off.</p>
              </div>
              <Link
                to="/decks"
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Continue studying
              </Link>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} CardSparks
      </footer>
    </div>
  );
}
