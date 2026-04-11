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
      'General': 'bg-gray-100 text-gray-600 border-gray-300',
      'Science': 'bg-[#ddf4ff] text-[#1cb0f6] border-[#1cb0f6]',
      'Math': 'bg-[#f3e8ff] text-[#ce82ff] border-[#ce82ff]',
      'History': 'bg-[#fff3d6] text-[#ff9600] border-[#ff9600]',
      'Language': 'bg-[#d7ffb8] text-[#58CC02] border-[#58CC02]',
      'Geography': 'bg-[#ddf4ff] text-[#1899d6] border-[#1899d6]',
      'Art': 'bg-[#f3e8ff] text-[#ce82ff] border-[#ce82ff]',
      'Music': 'bg-[#fff3d6] text-[#ffc800] border-[#ffc800]',
      'Programming': 'bg-[#ffe8e8] text-[#ff4b4b] border-[#ff4b4b]',
      'Other': 'bg-gray-100 text-gray-600 border-gray-300'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="group bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] hover:border-[#58CC02] transition-all duration-150 overflow-hidden">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-black text-gray-800 flex-1 mr-3 line-clamp-2 group-hover:text-[#58CC02] transition-colors leading-tight">
            {deck.name}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border-2 shrink-0 ${getCategoryColor(deck.category)}`}>
            {deck.category}
          </span>
        </div>

        {deck.description && (
          <p className="text-gray-500 text-sm font-semibold mb-4 line-clamp-2 leading-relaxed">
            {deck.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm mb-3">
          <div className="flex items-center gap-1.5 font-extrabold text-[#1cb0f6]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {deck.cardCount || 0} cards
          </div>
          {deck.isPublic && (
            <span className="text-xs font-extrabold text-[#58CC02] bg-[#d7ffb8] px-2 py-0.5 rounded-full">PUBLIC</span>
          )}
        </div>

        <p className="text-xs font-bold text-gray-400">Updated {formatDate(deck.updatedAt)}</p>
      </div>

      {/* Card Actions */}
      <div className="border-t-2 border-[#e5e5e5] bg-[#f7f7f7] p-3 flex gap-2">
        <Link
          to={`/decks/${deck.id}/study`}
          className="btn-duo btn-duo-green flex-1 text-sm py-2.5 text-center"
        >
          STUDY
        </Link>
        <Link
          to={`/decks/${deck.id}/cards`}
          className="btn-duo btn-duo-blue flex-1 text-sm py-2.5 text-center"
        >
          CARDS
        </Link>
        <button
          onClick={() => onEdit(deck)}
          className="btn-duo btn-duo-ghost px-3 py-2.5"
          title="Edit deck"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(deck.id)}
          className="btn-duo btn-duo-red px-3 py-2.5"
          title="Delete deck"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
