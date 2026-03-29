import React, { useState, useEffect } from 'react';
import { createCard, updateCard } from '../services/cardService';
import toast from 'react-hot-toast';

export default function CardForm({ card, deckId, onClose }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hints, setHints] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  const isEditing = !!card;

  useEffect(() => {
    if (card) {
      setFront(card.front || '');
      setBack(card.back || '');
      setHints((card.hints || []).join('\n'));
      setDifficulty(card.difficulty || 'medium');
    }
  }, [card]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      toast.error('Both front and back are required');
      return;
    }

    setLoading(true);
    try {
      const cardData = {
        front: front.trim(),
        back: back.trim(),
        hints: hints.split('\n').map(h => h.trim()).filter(Boolean),
        difficulty
      };

      if (isEditing) {
        await updateCard(card.id, cardData);
        toast.success('Card updated');
      } else {
        await createCard(deckId, cardData);
        toast.success('Card created');
        // Reset form for quick add
        setFront('');
        setBack('');
        setHints('');
        setDifficulty('medium');
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update card' : 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  const difficultyColors = {
    easy: 'bg-green-50 border-green-300 text-green-700',
    medium: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    hard: 'bg-red-50 border-red-300 text-red-700'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Card' : 'Add New Card'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Front */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Front (Question)
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="What is the question?"
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Back */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Back (Answer)
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="What is the answer?"
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Hints */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hints <span className="text-gray-400 font-normal">(one per line, optional)</span>
            </label>
            <textarea
              value={hints}
              onChange={(e) => setHints(e.target.value)}
              placeholder="Add hints to help remember..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
            <div className="flex gap-3">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium text-sm capitalize transition-all ${
                    difficulty === level
                      ? difficultyColors[level]
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Done'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : isEditing ? 'Update Card' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
