import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { signInWithGoogle, signOut, onAuthStateChanged } from './firebase'

export default function HomePage() {
  const [user, setUser] = useState(null)

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
    {
      to: '/calculator',
      title: 'Calculator',
      gradient: 'from-orange-400 to-pink-500',
      hoverGradient: 'hover:from-orange-500 hover:to-pink-600'
    },
    {
      to: '/arduino',
      title: 'Arduino',
      gradient: 'from-teal-400 to-cyan-500',
      hoverGradient: 'hover:from-teal-500 hover:to-cyan-600'
    },
    {
      to: '/search',
      title: 'Search',
      gradient: 'from-violet-500 to-fuchsia-500',
      hoverGradient: 'hover:from-violet-600 hover:to-fuchsia-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Welcome!
        </h1>
        <p className="text-gray-600 mb-6">
          Make learning fun with flash cards!
        </p>

        {/* Auth Section */}
        <div className="mb-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
          {user ? (
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium truncate mr-2">
                Hello, {user.displayName || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gray-400 hover:bg-gray-500 text-white text-sm px-4 py-2 rounded-full transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3 rounded-xl transition shadow-lg"
            >
              Sign In with Google
            </button>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 gap-6 mt-4">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`bg-gradient-to-r ${item.gradient} ${item.hoverGradient} text-white py-6 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center`}
            >
              <span className="font-bold text-xl">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
