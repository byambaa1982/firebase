import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { signInWithGoogle, signOut, onAuthStateChanged } from './firebase'

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [cookieCount, setCookieCount] = useState(0)
  const [consoles, setConsoles] = useState(0)
  const [consoleMultiplier, setConsoleMultiplier] = useState(1)

  const consoleCost = Math.floor(20 * Math.pow(1.15, consoles))
  const doublerCost = 200
  const cookiesPerSec = consoles * consoleMultiplier

  // Passive income
  useEffect(() => {
    if (consoles === 0) return
    const interval = setInterval(() => {
      setCookieCount(c => c + consoles * consoleMultiplier)
    }, 1000)
    return () => clearInterval(interval)
  }, [consoles, consoleMultiplier])

  const buyConsole = () => {
    if (cookieCount >= consoleCost) {
      setCookieCount(c => c - consoleCost)
      setConsoles(n => n + 1)
    }
  }

  const buyDoubler = () => {
    if (cookieCount >= doublerCost && consoleMultiplier === 1) {
      setCookieCount(c => c - doublerCost)
      setConsoleMultiplier(2)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(u => {
      setUser(u)
    })
    return unsubscribe
  }, [])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error('Sign in failed', err)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Sign out failed', err)
    }
  }

  const navItems = [
    { to: '/calculator', title: 'Calculator', icon: '🧮', desc: 'Crunch the numbers' },
    { to: '/arduino',    title: 'Arduino',    icon: '🔌', desc: 'Control your devices' },
    { to: '/search',     title: 'Search',     icon: '🔍', desc: 'Find what you need' },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col">

      {/* Hero — cookie dead-center */}
      <section className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-16">
        {/* Glow ring behind cookie */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-72 h-72 rounded-full bg-amber-500/20 blur-3xl" />
          <img
            src="/cookie.svg"
            alt="Cookie"
            className="relative w-56 h-56 md:w-72 md:h-72 drop-shadow-[0_0_60px_rgba(234,170,50,0.35)] cursor-pointer select-none
                       hover:scale-105 active:scale-95 transition-transform duration-200"
            onClick={() => setCookieCount(c => c + 1)}
          />
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center">
          <span className="text-8xl md:text-9xl font-black tabular-nums tracking-tight
                           bg-gradient-to-b from-amber-300 via-orange-400 to-amber-600
                           bg-clip-text text-transparent">
            {cookieCount}
          </span>
          <span className="mt-1 text-sm font-medium uppercase tracking-[0.35em] text-white/50">
            cookies baked
          </span>
          {consoles > 0 && (
            <span className="mt-1 text-xs text-emerald-400/70">
              +{cookiesPerSec} / sec
            </span>
          )}
        </div>
      </section>

      {/* Shop */}
      <section className="mx-auto w-full max-w-2xl px-4 pb-6">
        <h2 className="text-lg font-bold text-white/70 uppercase tracking-widest mb-3 text-center">
          Shop
        </h2>
        <button
          onClick={buyConsole}
          disabled={cookieCount < consoleCost}
          className={`w-full rounded-2xl border p-5 flex items-center gap-5 transition-all duration-200
            ${cookieCount >= consoleCost
              ? 'bg-white/[0.06] border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-400/50 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
              : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
            }`}
        >
          <span className="text-4xl">💻</span>
          <div className="flex-1 text-left">
            <div className="font-bold text-base text-white/90">JavaScript Console</div>
            <div className="text-xs text-white/40 mt-0.5">
              Generates <span className="text-emerald-400">{consoleMultiplier} cookie/sec</span> each
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-amber-400">{consoleCost} 🍪</div>
            <div className="text-xs text-white/30">owned: {consoles}</div>
          </div>
        </button>

        {/* Doubler upgrade — unlocks at 5 consoles */}
        {consoles >= 5 && consoleMultiplier === 1 && (
          <button
            onClick={buyDoubler}
            disabled={cookieCount < doublerCost}
            className={`w-full rounded-2xl border p-5 flex items-center gap-5 transition-all duration-200 mt-3
              ${cookieCount >= doublerCost
                ? 'bg-white/[0.06] border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-400/50 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer'
                : 'bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed'
              }`}
          >
            <span className="text-4xl">⚡</span>
            <div className="flex-1 text-left">
              <div className="font-bold text-base text-white/90">Console Overclock</div>
              <div className="text-xs text-white/40 mt-0.5">
                Doubles output of all JavaScript Consoles to <span className="text-purple-400">2 cookies/sec</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-amber-400">{doublerCost} 🍪</div>
              <div className="text-xs text-purple-400/60">upgrade</div>
            </div>
          </button>
        )}
      </section>

      {/* Content card */}
      <section className="mx-auto w-full max-w-2xl px-4 pb-16">
        <div className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10
                        shadow-[0_8px_40px_rgba(0,0,0,0.35)] p-8 md:p-10">

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-1">
            Welcome
          </h1>
          <p className="text-center text-white/50 text-sm mb-8">
            Make learning fun with flash cards
          </p>

          {/* Auth */}
          <div className="mb-8 rounded-2xl bg-white/[0.05] border border-white/10 p-5">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-white/80 font-medium truncate">
                  Hello, {user.displayName || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white/80
                             text-sm font-medium px-5 py-2 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-600
                           hover:from-rose-600 hover:to-pink-700 text-white font-bold
                           py-3.5 transition shadow-lg shadow-rose-500/25"
              >
                Sign In with Google
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {navItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex flex-col items-center gap-2 rounded-2xl
                           bg-white/[0.04] border border-white/10 p-6
                           hover:bg-white/[0.09] hover:border-white/20
                           hover:shadow-lg hover:-translate-y-0.5
                           transition-all duration-200"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="font-bold text-base text-white/90">{item.title}</span>
                <span className="text-xs text-white/40">{item.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6">
          &copy; {new Date().getFullYear()} Cookie Clicker &middot; Built with React &amp; Vite
        </p>
      </section>
    </div>
  )
}
