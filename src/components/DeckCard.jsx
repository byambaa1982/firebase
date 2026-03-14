import React from 'react';
import { Link } from 'react-router-dom';

export default function DeckCard({ deck, onEdit, onDelete }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'General': 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700',
      'Science': 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700',
      'Math': 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700',
      'History': 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800',
      'Language': 'bg-gradient-to-br from-green-100 to-green-200 text-green-700',
      'Geography': 'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700',
      'Art': 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700',
      'Music': 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700',
      'Programming': 'bg-gradient-to-br from-red-100 to-red-200 text-red-700',
      'Other': 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
      {/* Gradient Top Border */}
      <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      
      {/* Card Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-gray-800 flex-1 mr-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {deck.name}
          </h3>
          <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm ${getCategoryColor(deck.category)}`}>
            {deck.category}
          </span>
        </div>

        {deck.description && (
          <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
            {deck.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm mb-5">
          <div className="flex items-center gap-2 text-blue-600 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>{deck.cardCount || 0} cards</span>
          </div>
          {deck.isPublic && (
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Public</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Updated {formatDate(deck.updatedAt)}</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 p-4 flex gap-3">
        <Link
          to={`/decks/${deck.id}/cards`}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm"
        >
          View Cards
        </Link>
        <button
          onClick={() => onEdit(deck)}
          className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border-2 border-gray-200 transform hover:scale-105 active:scale-95"
          title="Edit deck"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(deck.id)}
          className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border-2 border-red-200 transform hover:scale-105 active:scale-95"
          title="Delete deck"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
