import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleGoogleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Google Search
          </h1>
          <Link
            to="/"
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition"
          >
            ← Back
          </Link>
        </div>

        <form onSubmit={handleGoogleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full px-5 py-4 pr-12 text-lg border-2 border-gray-200 rounded-xl outline-none focus:border-purple-400 transition bg-gray-50"
            />
            <svg 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M21.71 20.29l-4.2-4.2a9 9 0 1 0-1.42 1.42l4.2 4.2a1 1 0 0 0 1.42-1.42zM10 17a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/>
            </svg>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-4 rounded-xl transition shadow-lg"
          >
            Search Google
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Results will open in a new tab
          </p>
        </div>
      </div>
    </div>
  )
}
