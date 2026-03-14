import React, { useState, useEffect } from 'react';
import { createDeck, updateDeck } from '../services/deckService';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'General',
  'Science',
  'Math',
  'History',
  'Language',
  'Geography',
  'Art',
  'Music',
  'Programming',
  'Other'
];

export default function DeckForm({ deck, onClose, userId }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    isPublic: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deck) {
      setFormData({
        name: deck.name,
        description: deck.description || '',
        category: deck.category || 'General',
        isPublic: deck.isPublic || false
      });
    }
  }, [deck]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a deck name');
      return;
    }

    setLoading(true);

    try {
      if (deck) {
        // Update existing deck
        await updateDeck(deck.id, formData);
        toast.success('Deck updated successfully!');
      } else {
        // Create new deck
        await createDeck(userId, formData);
        toast.success('Deck created successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving deck:', error);
      toast.error(`Failed to ${deck ? 'update' : 'create'} deck`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {deck ? 'Edit Deck' : 'Create New Deck'}
              </h2>
              <p className="text-blue-100 text-sm">
                {deck ? 'Update your deck information' : 'Start building your flashcard collection'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Deck Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
              Deck Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="e.g., Spanish Vocabulary, Biology Terms"
              required
              maxLength={100}
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100 characters
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              placeholder="What is this deck about?"
              maxLength={500}
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white font-medium"
              disabled={loading}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Public Toggle */}
          <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="w-5 h-5 mt-1 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <div className="flex-1">
              <label htmlFor="isPublic" className="block font-bold text-gray-800 cursor-pointer mb-1">
                Make this deck public
              </label>
              <p className="text-sm text-gray-600">
                Other users can discover and clone this deck
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition border-2 border-gray-200 hover:border-gray-300 shadow-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span>{deck ? 'Update Deck' : 'Create Deck'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
