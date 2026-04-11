import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDeck } from '../services/deckService';
import {
  subscribeToDeckCards,
  deleteCard,
  duplicateCard,
  bulkDeleteCards,
  bulkImportCards
} from '../services/cardService';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import CardPreview from '../components/CardPreview';
import CardForm from '../components/CardForm';

export default function CardsPage() {
  const { deckId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCardForm, setShowCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const fileInputRef = useRef(null);

  // Load deck info
  useEffect(() => {
    const loadDeck = async () => {
      try {
        const deckData = await getDeck(deckId);
        if (deckData.createdBy !== currentUser.uid) {
          toast.error('You do not have access to this deck');
          navigate('/decks');
          return;
        }
        setDeck(deckData);
      } catch (error) {
        toast.error('Deck not found');
        navigate('/decks');
      }
    };
    loadDeck();
  }, [deckId, currentUser, navigate]);

  // Subscribe to cards
  useEffect(() => {
    if (!deckId) return;

    const unsubscribe = subscribeToDeckCards(deckId, (updatedCards) => {
      setCards(updatedCards);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deckId]);

  const handleAddCard = () => {
    setSelectedCard(null);
    setShowCardForm(true);
  };

  const handleEditCard = (card) => {
    setSelectedCard(card);
    setShowCardForm(true);
  };

  const handleDeleteCard = async (card) => {
    if (!window.confirm(`Delete this card?\n\nFront: ${card.front}`)) return;
    try {
      await deleteCard(card.id, deckId);
      toast.success('Card deleted');
    } catch (error) {
      toast.error('Failed to delete card');
    }
  };

  const handleDuplicateCard = async (card) => {
    try {
      await duplicateCard(card.id, deckId);
      toast.success('Card duplicated');
    } catch (error) {
      toast.error('Failed to duplicate card');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCards.size === 0) return;
    if (!window.confirm(`Delete ${selectedCards.size} selected card(s)?`)) return;
    try {
      await bulkDeleteCards([...selectedCards], deckId);
      setSelectedCards(new Set());
      toast.success(`${selectedCards.size} card(s) deleted`);
    } catch (error) {
      toast.error('Failed to delete cards');
    }
  };

  const toggleSelectCard = (cardId) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map((c) => c.id)));
    }
  };

  // CSV / JSON Import
  const handleImport = async () => {
    const text = importText.trim();
    if (!text) {
      toast.error('Paste some content to import');
      return;
    }

    let parsed = [];

    // Try JSON first
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        parsed = json
          .filter((item) => item.front && item.back)
          .map((item) => ({ front: item.front, back: item.back, difficulty: item.difficulty }));
      }
    } catch {
      // Fallback: treat as tab/comma separated lines (front\tback or front,back)
      const lines = text.split('\n').filter((l) => l.trim());
      for (const line of lines) {
        const sep = line.includes('\t') ? '\t' : ',';
        const parts = line.split(sep).map((p) => p.trim());
        if (parts.length >= 2) {
          parsed.push({ front: parts[0], back: parts[1] });
        }
      }
    }

    if (parsed.length === 0) {
      toast.error('No valid cards found. Use JSON or CSV format (front, back)');
      return;
    }

    try {
      await bulkImportCards(deckId, parsed);
      toast.success(`${parsed.length} card(s) imported`);
      setImportText('');
      setShowImport(false);
    } catch (error) {
      toast.error('Failed to import cards');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportText(event.target.result);
    };
    reader.readAsText(file);
  };

  // Filter cards
  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === 'All' || card.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-5 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* Back + Title */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/decks')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{deck?.name}</h1>
              {deck?.description && (
                <p className="text-sm text-gray-500 mt-0.5">{deck.description}</p>
              )}
            </div>
            <span className="text-sm text-gray-400">{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Actions row */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddCard}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Card
            </button>
            <button
              onClick={() => setShowImport(!showImport)}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </button>
            {selectedCards.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-50 hover:bg-red-100 border border-red-300 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete ({selectedCards.size})
              </button>
            )}
          </div>
        </div>

        {/* Import Panel */}
        {showImport && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Import Cards</h3>
            <p className="text-sm text-gray-500 mb-3">
              Paste CSV (front, back per line), tab-separated, or JSON array.
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={"What is React?, A JavaScript library for building UIs\nWhat is JSX?, A syntax extension for JavaScript"}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-sm mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Import
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => { setShowImport(false); setImportText(''); }}
                className="text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        {cards.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="All">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {cards.length > 1 && (
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {selectedCards.size === filteredCards.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        )}

        {/* Cards Grid */}
        {filteredCards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            {searchTerm || filterDifficulty !== 'All' ? (
              <>
                <p className="text-gray-500 mb-4">No cards match your search</p>
                <button
                  onClick={() => { setSearchTerm(''); setFilterDifficulty('All'); }}
                  className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">No cards yet</h2>
                <p className="text-gray-500 mb-6 text-sm">Add your first flashcard to start studying</p>
                <button
                  onClick={handleAddCard}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
                >
                  Add First Card
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card, index) => (
              <div key={card.id} className="relative">
                {/* Selection checkbox */}
                {selectedCards.size > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedCards.has(card.id)}
                      onChange={() => toggleSelectCard(card.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
                <CardPreview
                  card={card}
                  index={index}
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                  onDuplicate={handleDuplicateCard}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Form Modal */}
      {showCardForm && (
        <CardForm
          card={selectedCard}
          deckId={deckId}
          onClose={() => { setShowCardForm(false); setSelectedCard(null); }}
        />
      )}
    </div>
  );
}
