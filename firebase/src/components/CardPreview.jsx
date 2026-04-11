import React, { useState } from 'react';

export default function CardPreview({ card, index, onEdit, onDelete, onDuplicate }) {
  const [flipped, setFlipped] = useState(false);

  const difficultyBadge = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden">
      {/* Card Content — click to flip */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="p-5 cursor-pointer min-h-[120px] flex flex-col justify-between select-none"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xs text-gray-400 font-medium">#{index + 1}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${difficultyBadge[card.difficulty] || difficultyBadge.medium}`}>
              {card.difficulty || 'medium'}
            </span>
            <span className="text-xs text-gray-400">
              {flipped ? 'BACK' : 'FRONT'}
            </span>
          </div>
        </div>

        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap flex-1">
          {flipped ? card.back : card.front}
        </p>

        {/* Hints indicator */}
        {card.hints && card.hints.length > 0 && !flipped && (
          <div className="mt-3 text-xs text-blue-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {card.hints.length} hint{card.hints.length > 1 ? 's' : ''}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">Click to flip</p>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-end gap-1 bg-gray-50">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(card); }}
          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          title="Duplicate"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(card); }}
          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(card); }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
