import React from 'react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-pink-200 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to Flash Fun!</h1>
        <p className="text-lg text-gray-700 mb-6">Make learning fun with flash cards!<br />Sign in, create your own cards, and test your memory with cool images.</p>
        <img src="https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_1280.png" alt="Kids learning" className="mx-auto mb-6 w-12 h-12 object-contain rounded-full border-4 border-pink-300" />
        <div className="mb-4 text-green-600 font-bold">This is a test text. If you see this, changes are working!</div>
        <a href="/login" className="inline-block bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 px-6 rounded-full shadow transition">Sign In & Start Learning</a>
      </div>
      <footer className="mt-8 text-gray-500 text-sm">Made for kids • Safe & Fun</footer>
    </div>
  )
}
