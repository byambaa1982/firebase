import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { subscribeToUserDecks, deleteDeck } from './services/deckService';
import toast from 'react-hot-toast';
import DeckCard from './components/DeckCard';
import DeckForm from './components/DeckForm';
import Navbar from './components/Navbar';

export default function DecksPage() {
  const { currentUser } = useAuth();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeckForm, setShowDeckForm] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Subscribe to real-time deck updates
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserDecks(currentUser.uid, (updatedDecks) => {
      setDecks(updatedDecks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCreateDeck = () => {
    setSelectedDeck(null);
    setShowDeckForm(true);
  };

  const handleEditDeck = (deck) => {
    setSelectedDeck(deck);
    setShowDeckForm(true);
  };

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this deck? This cannot be undone.')) {
      return;
    }

    try {
      await deleteDeck(deckId, currentUser.uid);
      toast.success('Deck deleted successfully');
    } catch (error) {
      console.error('Error deleting deck:', error);
      toast.error('Failed to delete deck');
    }
  };

  const handleFormClose = () => {
    setShowDeckForm(false);
    setSelectedDeck(null);
  };

  // Filter and search decks
  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deck.description && deck.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || deck.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from decks
  const categories = ['All', ...new Set(decks.map(deck => deck.category))];

  // Loading Skeleton Component
  const DeckCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-400"></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="space-y-2 mb-5">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex gap-6 mb-5">
          <div className="h-5 bg-gray-200 rounded w-20"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="border-t-2 border-gray-100 bg-gray-50 p-4 flex gap-3">
        <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
        <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
        <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <DeckCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                My Flashcard Decks
              </h1>
              <p className="text-gray-600">Organize and manage your learning materials</p>
            </div>
            <button
              onClick={handleCreateDeck}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 justify-center transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Deck
            </button>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search your decks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition bg-white font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600">{decks.length}</div>
              <div className="text-sm text-blue-700 font-medium">Total Decks</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-600">{decks.reduce((sum, deck) => sum + (deck.cardCount || 0), 0)}</div>
              <div className="text-sm text-purple-700 font-medium">Total Cards</div>
            </div>
          </div>
        </div>

        {/* Decks Grid */}
        {filteredDecks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            {searchTerm || filterCategory !== 'All' ? (
              <>
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No decks found</h2>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('All');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition transform hover:scale-105 active:scale-95"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6 animate-pulse">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">No decks yet</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">Create your first flashcard deck to begin your learning journey!</p>
                <button
                  onClick={handleCreateDeck}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Create Your First Deck
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDecks.map(deck => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onEdit={handleEditDeck}
                onDelete={handleDeleteDeck}
              />
            ))}
          </div>
        )}
      </div>

      {/* Deck Form Modal */}
      {showDeckForm && (
        <DeckForm
          deck={selectedDeck}
          onClose={handleFormClose}
          userId={currentUser.uid}
        />
      )}
    </div>
  );
}
