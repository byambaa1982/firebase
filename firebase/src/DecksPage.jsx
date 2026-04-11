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
    <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] overflow-hidden animate-pulse">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-28"></div>
      </div>
      <div className="border-t-2 border-[#e5e5e5] bg-[#f7f7f7] p-3 flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-2xl"></div>
        <div className="flex-1 h-10 bg-gray-200 rounded-2xl"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-2xl"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-8 mb-8">
            <div className="h-10 bg-gray-200 rounded-lg w-1/2 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-1/3 mb-6 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <DeckCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-8 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-800 mb-2">
                My Flashcard Decks
              </h1>
              <p className="text-gray-500 font-semibold">Organize and manage your learning materials</p>
            </div>
            <button
              onClick={handleCreateDeck}
              className="btn-duo btn-duo-green py-3 px-6 text-base flex items-center gap-2 justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              CREATE NEW DECK
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
                className="w-full pl-10 pr-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:ring-4 focus:ring-[#58CC02]/20 focus:border-[#58CC02] outline-none transition font-semibold"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:ring-4 focus:ring-[#58CC02]/20 focus:border-[#58CC02] outline-none transition bg-white font-bold"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="bg-[#d7ffb8] border-2 border-b-4 border-[#58CC02] rounded-2xl p-4">
              <div className="text-3xl font-black text-[#58CC02]">{decks.length}</div>
              <div className="text-sm text-green-800 font-extrabold">Total Decks</div>
            </div>
            <div className="bg-[#ddf4ff] border-2 border-b-4 border-[#1cb0f6] rounded-2xl p-4">
              <div className="text-3xl font-black text-[#1cb0f6]">{decks.reduce((sum, deck) => sum + (deck.cardCount || 0), 0)}</div>
              <div className="text-sm text-blue-800 font-extrabold">Total Cards</div>
            </div>
          </div>
        </div>

        {/* Decks Grid */}
        {filteredDecks.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-16 text-center">
            {searchTerm || filterCategory !== 'All' ? (
              <>
                <div className="bg-[#f7f7f7] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">No decks found</h2>
                <p className="text-gray-500 font-semibold mb-6">Try adjusting your search or filter</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('All');
                  }}
                  className="btn-duo btn-duo-blue py-2.5 px-6 text-sm"
                >
                  CLEAR FILTERS
                </button>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#d7ffb8] mb-6">
                  <svg className="w-12 h-12 text-[#58CC02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-3">No decks yet</h2>
                <p className="text-gray-500 font-semibold mb-8 max-w-md mx-auto text-lg">Create your first flashcard deck to begin your learning journey!</p>
                <button
                  onClick={handleCreateDeck}
                  className="btn-duo btn-duo-green py-3 px-8 text-base"
                >
                  CREATE YOUR FIRST DECK
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
