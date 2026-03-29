import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDeckCards } from '../services/cardService';
import { getDeck } from '../services/deckService';
import { createStudySession, endStudySession, updateCardProgress } from '../services/studyService';
import { calculateNextReview, getDueCards } from '../utils/spacedRepetition';
import FlashcardFlip from '../components/FlashcardFlip';
import toast from 'react-hot-toast';

const STUDY_MODES = {
  ALL: 'all',
  REVIEW: 'review',
  SHUFFLE: 'shuffle'
};

export default function StudyPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [studyCards, setStudyCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState(STUDY_MODES.ALL);
  const [sessionId, setSessionId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Session stats
  const [results, setResults] = useState({
    cardsStudied: 0,
    correctCount: 0,
    incorrectCount: 0,
    partialCount: 0,
    ratings: {} // cardId -> rating
  });

  // Load deck and cards
  useEffect(() => {
    const loadData = async () => {
      try {
        const [deckData, cardsData] = await Promise.all([
          getDeck(deckId),
          getDeckCards(deckId)
        ]);
        if (!deckData) {
          toast.error('Deck not found');
          navigate('/decks');
          return;
        }
        setDeck(deckData);
        setCards(cardsData);
      } catch (error) {
        console.error('Error loading study data:', error);
        toast.error('Failed to load deck');
        navigate('/decks');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [deckId, navigate]);

  // Prepare study cards when mode or cards change
  useEffect(() => {
    if (cards.length === 0) return;
    let selected;
    if (studyMode === STUDY_MODES.REVIEW) {
      selected = getDueCards(cards);
      if (selected.length === 0) {
        selected = [...cards]; // Fallback to all if none due
        toast('No cards due for review — showing all cards', { icon: 'ℹ️' });
      }
    } else if (studyMode === STUDY_MODES.SHUFFLE) {
      selected = [...cards].sort(() => Math.random() - 0.5);
    } else {
      selected = [...cards];
    }
    setStudyCards(selected);
    setCurrentIndex(0);
    setFlipped(false);
    setShowResults(false);
    setResults({ cardsStudied: 0, correctCount: 0, incorrectCount: 0, partialCount: 0, ratings: {} });
  }, [cards, studyMode]);

  // Start session
  const startSession = async () => {
    setStartTime(Date.now());
    if (currentUser) {
      const session = await createStudySession(currentUser.uid, deckId, studyCards.length);
      if (session) setSessionId(session.id);
    }
  };

  useEffect(() => {
    if (studyCards.length > 0 && !sessionId && !showResults) {
      startSession();
    }
  }, [studyCards]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (showResults) return;
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f); }
      if (e.code === 'ArrowRight' && flipped) handleRating(5);
      if (e.code === 'ArrowLeft' && flipped) handleRating(0);
      if (e.code === 'ArrowDown' && flipped) handleRating(3);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipped, showResults, currentIndex, studyCards]);

  const handleRating = useCallback(async (quality) => {
    const card = studyCards[currentIndex];
    if (!card) return;

    // Update spaced repetition
    const newSR = calculateNextReview(card, quality);
    updateCardProgress(card.id, newSR);

    // Track results
    setResults(prev => {
      const updated = { ...prev, cardsStudied: prev.cardsStudied + 1, ratings: { ...prev.ratings, [card.id]: quality } };
      if (quality >= 4) updated.correctCount = prev.correctCount + 1;
      else if (quality >= 2) updated.partialCount = prev.partialCount + 1;
      else updated.incorrectCount = prev.incorrectCount + 1;
      return updated;
    });

    // Next card or finish
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(i => i + 1);
      setFlipped(false);
    } else {
      finishSession();
    }
  }, [currentIndex, studyCards]);

  const finishSession = async () => {
    setShowResults(true);
    if (sessionId) {
      await endStudySession(sessionId, results);
    }
  };

  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  // --- LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading study session...</p>
        </div>
      </div>
    );
  }

  // --- NO CARDS ---
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-lg p-12 max-w-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Cards Yet</h2>
          <p className="text-gray-500 mb-6">Add some flashcards to this deck before studying.</p>
          <button
            onClick={() => navigate(`/decks/${deckId}/cards`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition"
          >
            Add Cards
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS ---
  if (showResults) {
    const accuracy = results.cardsStudied > 0 ? Math.round((results.correctCount / results.cardsStudied) * 100) : 0;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
          <div className="text-6xl mb-4">
            {accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Session Complete!</h2>
          <p className="text-gray-500 mb-8">{deck?.name}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-green-600">{results.correctCount}</div>
              <div className="text-sm text-green-700 font-medium">Knew It</div>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-yellow-600">{results.partialCount}</div>
              <div className="text-sm text-yellow-700 font-medium">Partially</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-red-600">{results.incorrectCount}</div>
              <div className="text-sm text-red-700 font-medium">Didn't Know</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
              <div className="text-sm text-blue-700 font-medium">Accuracy</div>
            </div>
          </div>

          <div className="text-sm text-gray-400 mb-8">
            {results.cardsStudied} cards in {minutes}m {seconds}s
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentIndex(0);
                setFlipped(false);
                setSessionId(null);
                setResults({ cardsStudied: 0, correctCount: 0, incorrectCount: 0, partialCount: 0, ratings: {} });
                setStartTime(Date.now());
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition"
            >
              Study Again
            </button>
            <button
              onClick={() => navigate('/decks')}
              className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition"
            >
              Back to Decks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STUDY SESSION ---
  const currentCard = studyCards[currentIndex];
  const progress = ((currentIndex) / studyCards.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/decks')}
            className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Exit
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{deck?.name}</h1>
            <p className="text-xs text-gray-400">{currentIndex + 1} / {studyCards.length}</p>
          </div>

          {/* Study Mode Selector */}
          <select
            value={studyMode}
            onChange={(e) => setStudyMode(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white"
          >
            <option value={STUDY_MODES.ALL}>All Cards</option>
            <option value={STUDY_MODES.REVIEW}>Due for Review</option>
            <option value={STUDY_MODES.SHUFFLE}>Shuffle</option>
          </select>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <FlashcardFlip
          card={currentCard}
          flipped={flipped}
          onFlip={() => setFlipped(f => !f)}
        />

        {/* Rating Buttons — only shown after flip */}
        {flipped && (
          <div className="mt-8 flex gap-4 animate-fadeIn">
            <button
              onClick={() => handleRating(0)}
              className="flex flex-col items-center gap-1 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-700 font-bold py-4 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95 min-w-[100px]"
            >
              <span className="text-2xl">😕</span>
              <span className="text-xs">Didn't Know</span>
            </button>
            <button
              onClick={() => handleRating(3)}
              className="flex flex-col items-center gap-1 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 text-yellow-700 font-bold py-4 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95 min-w-[100px]"
            >
              <span className="text-2xl">🤔</span>
              <span className="text-xs">Partially</span>
            </button>
            <button
              onClick={() => handleRating(5)}
              className="flex flex-col items-center gap-1 bg-green-50 hover:bg-green-100 border-2 border-green-200 text-green-700 font-bold py-4 px-6 rounded-2xl transition-all hover:scale-105 active:scale-95 min-w-[100px]"
            >
              <span className="text-2xl">😄</span>
              <span className="text-xs">Knew It!</span>
            </button>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        <div className="mt-6 text-xs text-gray-400 text-center hidden md:block">
          <span className="bg-gray-100 px-2 py-1 rounded">Space</span> flip
          {flipped && (
            <>
              {' · '}
              <span className="bg-gray-100 px-2 py-1 rounded">←</span> didn't know
              {' · '}
              <span className="bg-gray-100 px-2 py-1 rounded">↓</span> partial
              {' · '}
              <span className="bg-gray-100 px-2 py-1 rounded">→</span> knew it
            </>
          )}
        </div>
      </div>
    </div>
  );
}
