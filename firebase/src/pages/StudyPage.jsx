import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDeckCards } from '../services/cardService';
import { getDeck } from '../services/deckService';
import { createStudySession, endStudySession, updateCardProgress } from '../services/studyService';
import { calculateNextReview, getDueCards } from '../utils/spacedRepetition';
import { explainCard, isAIConfigured } from '../services/aiService';
import FlashcardFlip from '../components/FlashcardFlip';
import toast from 'react-hot-toast';

const STUDY_MODES = {
  ALL: 'all',
  REVIEW: 'review',
  SHUFFLE: 'shuffle',
  QUIZ: 'quiz'
};

// Generate multiple-choice options from other cards
function generateQuizOptions(currentCard, allCards) {
  const wrong = allCards
    .filter(c => c.id !== currentCard.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(c => c.back);
  const options = [...wrong, currentCard.back].sort(() => Math.random() - 0.5);
  return options;
}

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
  const [elapsedDisplay, setElapsedDisplay] = useState('0:00');

  // Quiz mode state
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Results tab
  const [resultsTab, setResultsTab] = useState('summary'); // 'summary' | 'cards'

  // AI Tutor state
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Session stats
  const [results, setResults] = useState({
    cardsStudied: 0,
    correctCount: 0,
    incorrectCount: 0,
    partialCount: 0,
    ratings: {} // cardId -> quality
  });

  // Live timer
  const timerRef = useRef(null);
  useEffect(() => {
    if (startTime && !showResults) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        setElapsedDisplay(`${m}:${s.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime, showResults]);

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
        selected = [...cards];
        toast('No cards due for review — showing all cards', { icon: 'ℹ️' });
      }
    } else if (studyMode === STUDY_MODES.SHUFFLE || studyMode === STUDY_MODES.QUIZ) {
      selected = [...cards].sort(() => Math.random() - 0.5);
    } else {
      selected = [...cards];
    }
    setStudyCards(selected);
    setCurrentIndex(0);
    setFlipped(false);
    setShowResults(false);
    setSelectedAnswer(null);
    setQuizAnswered(false);
    setResults({ cardsStudied: 0, correctCount: 0, incorrectCount: 0, partialCount: 0, ratings: {} });
  }, [cards, studyMode]);

  // Generate quiz options when card changes in quiz mode
  useEffect(() => {
    if (studyMode === STUDY_MODES.QUIZ && studyCards.length > 0 && currentIndex < studyCards.length) {
      setQuizOptions(generateQuizOptions(studyCards[currentIndex], cards));
      setSelectedAnswer(null);
      setQuizAnswered(false);
    }
  }, [currentIndex, studyMode, studyCards, cards]);

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
      if (studyMode === STUDY_MODES.QUIZ) {
        if (['1', '2', '3', '4'].includes(e.key) && !quizAnswered) {
          const idx = parseInt(e.key) - 1;
          if (idx < quizOptions.length) handleQuizAnswer(quizOptions[idx]);
        }
        if (e.code === 'Space' && quizAnswered) { e.preventDefault(); advanceAfterQuiz(); }
        return;
      }
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f); }
      if (e.code === 'ArrowRight' && flipped) handleRating(5);
      if (e.code === 'ArrowLeft' && flipped) handleRating(0);
      if (e.code === 'ArrowDown' && flipped) handleRating(3);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipped, showResults, currentIndex, studyCards, studyMode, quizAnswered, quizOptions]);

  const handleRating = useCallback(async (quality) => {
    const card = studyCards[currentIndex];
    if (!card) return;

    const newSR = calculateNextReview(card, quality);
    updateCardProgress(card.id, newSR);

    setResults(prev => {
      const updated = { ...prev, cardsStudied: prev.cardsStudied + 1, ratings: { ...prev.ratings, [card.id]: quality } };
      if (quality >= 4) updated.correctCount = prev.correctCount + 1;
      else if (quality >= 2) updated.partialCount = prev.partialCount + 1;
      else updated.incorrectCount = prev.incorrectCount + 1;
      return updated;
    });

    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(i => i + 1);
      setFlipped(false);
      setAiExplanation('');
    } else {
      finishSession();
    }
  }, [currentIndex, studyCards]);

  // Quiz mode answer handler
  const handleQuizAnswer = (answer) => {
    if (quizAnswered) return;
    setSelectedAnswer(answer);
    setQuizAnswered(true);
    const card = studyCards[currentIndex];
    const isCorrect = answer === card.back;
    const quality = isCorrect ? 5 : 0;

    const newSR = calculateNextReview(card, quality);
    updateCardProgress(card.id, newSR);

    setResults(prev => {
      const updated = { ...prev, cardsStudied: prev.cardsStudied + 1, ratings: { ...prev.ratings, [card.id]: quality } };
      if (isCorrect) updated.correctCount = prev.correctCount + 1;
      else updated.incorrectCount = prev.incorrectCount + 1;
      return updated;
    });
  };

  const advanceAfterQuiz = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    setShowResults(true);
    clearInterval(timerRef.current);
    if (sessionId) {
      await endStudySession(sessionId, results);
    }
  };

  // Study only weak cards (cards rated < 4)
  const studyWeakCards = () => {
    const weakIds = Object.entries(results.ratings).filter(([, q]) => q < 4).map(([id]) => id);
    const weak = studyCards.filter(c => weakIds.includes(c.id));
    if (weak.length === 0) {
      toast.success('No weak cards — you nailed them all!');
      return;
    }
    setStudyCards(weak);
    setCurrentIndex(0);
    setFlipped(false);
    setShowResults(false);
    setSessionId(null);
    setSelectedAnswer(null);
    setQuizAnswered(false);
    setResults({ cardsStudied: 0, correctCount: 0, incorrectCount: 0, partialCount: 0, ratings: {} });
    setStartTime(Date.now());
  };

  const restartAll = () => {
    setShowResults(false);
    setCurrentIndex(0);
    setFlipped(false);
    setSessionId(null);
    setSelectedAnswer(null);
    setQuizAnswered(false);
    setResults({ cardsStudied: 0, correctCount: 0, incorrectCount: 0, partialCount: 0, ratings: {} });
    setStartTime(Date.now());
  };

  // --- LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Loading study session...</p>
        </div>
      </div>
    );
  }

  // --- NO CARDS ---
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-12 max-w-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">No Cards Yet</h2>
          <p className="text-gray-500 font-bold mb-6">Add some flashcards to this deck before studying.</p>
          <button
            onClick={() => navigate(`/decks/${deckId}/cards`)}
            className="btn-duo btn-duo-green text-base px-8 py-3"
          >
            ADD CARDS
          </button>
        </div>
      </div>
    );
  }

  // --- RESULTS ---
  if (showResults) {
    const accuracy = results.cardsStudied > 0 ? Math.round((results.correctCount / results.cardsStudied) * 100) : 0;
    const weakCards = studyCards.filter(c => (results.ratings[c.id] ?? -1) < 4 && results.ratings[c.id] !== undefined);
    const strongCards = studyCards.filter(c => (results.ratings[c.id] ?? -1) >= 4);

    return (
      <div className="min-h-screen bg-[#f7f7f7] p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] overflow-hidden mb-6">
            <div className="bg-[#58CC02] p-8 text-center text-white">
              <div className="text-6xl mb-3">
                {accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}
              </div>
              <h2 className="text-3xl font-black mb-1">Session Complete!</h2>
              <p className="text-[#d7ffb8] font-bold">{deck?.name} · {elapsedDisplay}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 divide-x divide-gray-100 text-center py-6">
              <div>
                <div className="text-2xl font-black text-[#58CC02]">{results.correctCount}</div>
                <div className="text-xs text-gray-500 mt-1 font-bold">Knew It</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#ffc800]">{results.partialCount}</div>
                <div className="text-xs text-gray-500 mt-1 font-bold">Partial</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#ff4b4b]">{results.incorrectCount}</div>
                <div className="text-xs text-gray-500 mt-1 font-bold">Missed</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#1cb0f6]">{accuracy}%</div>
                <div className="text-xs text-gray-500 mt-1 font-bold">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Tabs: Summary / Card Breakdown */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setResultsTab('summary')}
              className={`px-4 py-2 rounded-2xl text-sm font-extrabold transition border-2 border-b-4 ${resultsTab === 'summary' ? 'bg-[#1cb0f6] text-white border-[#1899d6]' : 'bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50'}`}
            >
              Summary
            </button>
            <button
              onClick={() => setResultsTab('cards')}
              className={`px-4 py-2 rounded-2xl text-sm font-extrabold transition border-2 border-b-4 ${resultsTab === 'cards' ? 'bg-[#1cb0f6] text-white border-[#1899d6]' : 'bg-white text-gray-600 border-[#e5e5e5] hover:bg-gray-50'}`}
            >
              Card Breakdown ({studyCards.length})
            </button>
          </div>

          {resultsTab === 'summary' ? (
            <div className="space-y-4">
              {/* Weak Cards Section */}
              {weakCards.length > 0 && (
                <div className="bg-[#ffdfe0] border-2 border-[#ff4b4b] rounded-2xl p-5">
                  <h3 className="font-extrabold text-[#ea2b2b] mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    Needs Review ({weakCards.length} cards)
                  </h3>
                  <div className="space-y-2">
                    {weakCards.slice(0, 5).map(card => (
                      <div key={card.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
                        <span className="text-lg">{results.ratings[card.id] === 0 ? '🔴' : '🟡'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{card.front}</p>
                          <p className="text-xs text-gray-500 truncate">{card.back}</p>
                        </div>
                      </div>
                    ))}
                    {weakCards.length > 5 && (
                      <p className="text-xs text-red-600 text-center mt-2">+{weakCards.length - 5} more</p>
                    )}
                  </div>
                </div>
              )}

              {/* Strong Cards */}
              {strongCards.length > 0 && (
                <div className="bg-[#d7ffb8] border-2 border-[#58CC02] rounded-2xl p-5">
                  <h3 className="font-extrabold text-[#46a302] mb-1 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Mastered ({strongCards.length} cards)
                  </h3>
                  <p className="text-sm text-[#46a302] font-bold">Great job! These cards will appear less frequently.</p>
                </div>
              )}
            </div>
          ) : (
            /* Card-by-card breakdown */
            <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] overflow-hidden">
              <div className="divide-y divide-gray-100">
                {studyCards.map((card, i) => {
                  const rating = results.ratings[card.id];
                  const ratingInfo = rating >= 4 ? { emoji: '🟢', label: 'Knew It', bg: 'bg-green-50' }
                    : rating >= 2 ? { emoji: '🟡', label: 'Partial', bg: 'bg-yellow-50' }
                    : rating !== undefined ? { emoji: '🔴', label: 'Missed', bg: 'bg-red-50' }
                    : { emoji: '⚪', label: 'Skipped', bg: 'bg-gray-50' };
                  return (
                    <div key={card.id} className={`flex items-center gap-3 px-5 py-4 ${ratingInfo.bg}`}>
                      <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                      <span className="text-lg">{ratingInfo.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{card.front}</p>
                        <p className="text-xs text-gray-500 truncate">{card.back}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-500">{ratingInfo.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            {weakCards.length > 0 && (
              <button
                onClick={studyWeakCards}
                className="btn-duo btn-duo-orange w-full text-base py-3.5"
              >
                STUDY WEAK CARDS ({weakCards.length})
              </button>
            )}
            <div className="flex gap-3">
              <button
                onClick={restartAll}
                className="btn-duo btn-duo-green flex-1 text-base py-3.5"
              >
                STUDY AGAIN
              </button>
              <button
                onClick={() => navigate('/decks')}
                className="btn-duo btn-duo-ghost flex-1 text-base py-3.5"
              >
                BACK TO DECKS
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STUDY SESSION ---
  const currentCard = studyCards[currentIndex];
  const progress = ((currentIndex) / studyCards.length) * 100;
  const isQuizMode = studyMode === STUDY_MODES.QUIZ;

  // Guard: studyCards not populated yet
  if (!currentCard) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Preparing cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b-2 border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/decks')}
            className="text-gray-500 hover:text-gray-700 font-extrabold flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Exit
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold text-gray-800 truncate max-w-[200px]">{deck?.name}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{currentIndex + 1} / {studyCards.length}</span>
              <span>·</span>
              <span className="font-mono">{elapsedDisplay}</span>
            </div>
          </div>

          {/* Study Mode Selector */}
          <select
            value={studyMode}
            onChange={(e) => setStudyMode(e.target.value)}
            className="text-sm border-2 border-[#e5e5e5] rounded-xl px-2 py-1 text-gray-600 bg-white font-bold"
          >
            <option value={STUDY_MODES.ALL}>All Cards</option>
            <option value={STUDY_MODES.REVIEW}>Due for Review</option>
            <option value={STUDY_MODES.SHUFFLE}>Shuffle</option>
            {cards.length >= 4 && <option value={STUDY_MODES.QUIZ}>Quick Quiz</option>}
          </select>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-[#e5e5e5] rounded-full mx-4 mb-1">
          <div
            className="h-full bg-[#58CC02] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {isQuizMode ? (
          /* --- QUIZ MODE --- */
          <div className="w-full max-w-2xl mx-auto">
            {/* Question */}
            <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-8 text-center mb-6">
              <span className="text-xs font-extrabold text-[#1cb0f6] uppercase tracking-widest mb-4 block">Question</span>
              <p className="text-2xl md:text-3xl font-black text-gray-800 leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {quizOptions.map((option, idx) => {
                let style = 'bg-white border-2 border-b-4 border-[#e5e5e5] hover:border-[#1cb0f6] hover:bg-[#ddf4ff] text-gray-800';
                if (quizAnswered) {
                  if (option === currentCard.back) {
                    style = 'bg-[#d7ffb8] border-2 border-b-4 border-[#58CC02] text-[#46a302]';
                  } else if (option === selectedAnswer && option !== currentCard.back) {
                    style = 'bg-[#ffdfe0] border-2 border-b-4 border-[#ff4b4b] text-[#ea2b2b]';
                  } else {
                    style = 'bg-gray-50 border-2 border-b-4 border-[#e5e5e5] text-gray-400';
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(option)}
                    disabled={quizAnswered}
                    className={`${style} rounded-2xl p-4 text-left font-medium transition-all flex items-center gap-3`}
                  >
                    <span className="bg-gray-100 text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-base">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Next button after answering */}
            {quizAnswered && (
              <div className="mt-6 text-center">
                <button
                  onClick={advanceAfterQuiz}
                  className="btn-duo btn-duo-green text-base py-3 px-10"
                >
                  {currentIndex < studyCards.length - 1 ? 'Next Question →' : 'See Results'}
                </button>
              </div>
            )}

            {/* Keyboard hint */}
            <div className="mt-4 text-xs text-gray-400 text-center hidden md:block">
              {!quizAnswered
                ? <>Press <span className="bg-gray-100 px-1.5 py-0.5 rounded">1</span>-<span className="bg-gray-100 px-1.5 py-0.5 rounded">4</span> to answer</>
                : <>Press <span className="bg-gray-100 px-1.5 py-0.5 rounded">Space</span> to continue</>
              }
            </div>
          </div>
        ) : (
          /* --- FLASHCARD MODE --- */
          <>
            <FlashcardFlip
              card={currentCard}
              flipped={flipped}
              onFlip={() => setFlipped(f => !f)}
            />

            {flipped && (
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => handleRating(0)}
                  className="flex flex-col items-center gap-1 bg-[#ffdfe0] hover:bg-[#ffc8c8] border-2 border-b-4 border-[#ff4b4b] text-[#ea2b2b] font-extrabold py-4 px-6 rounded-2xl transition-all active:translate-y-0.5 active:border-b-2 min-w-[100px]"
                >
                  <span className="text-2xl">😕</span>
                  <span className="text-xs">Didn't Know</span>
                </button>
                <button
                  onClick={() => handleRating(3)}
                  className="flex flex-col items-center gap-1 bg-[#fff3d6] hover:bg-[#ffe8b0] border-2 border-b-4 border-[#ffc800] text-[#996000] font-extrabold py-4 px-6 rounded-2xl transition-all active:translate-y-0.5 active:border-b-2 min-w-[100px]"
                >
                  <span className="text-2xl">🤔</span>
                  <span className="text-xs">Partially</span>
                </button>
                <button
                  onClick={() => handleRating(5)}
                  className="flex flex-col items-center gap-1 bg-[#d7ffb8] hover:bg-[#c4f59e] border-2 border-b-4 border-[#58CC02] text-[#46a302] font-extrabold py-4 px-6 rounded-2xl transition-all active:translate-y-0.5 active:border-b-2 min-w-[100px]"
                >
                  <span className="text-2xl">😄</span>
                  <span className="text-xs">Knew It!</span>
                </button>
              </div>
            )}

            {/* AI Tutor — explain this card */}
            {flipped && isAIConfigured() && (
              <div className="mt-4 w-full max-w-2xl mx-auto">
                {!aiExplanation && (
                  <button
                    onClick={async () => {
                      setAiLoading(true);
                      try {
                        const explanation = await explainCard(currentCard.front, currentCard.back);
                        setAiExplanation(explanation);
                      } catch {
                        toast.error('AI tutor unavailable right now');
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                    disabled={aiLoading}
                    className="w-full py-2.5 px-4 bg-white border-2 border-b-4 border-[#ce82ff] text-[#9d4edd] font-extrabold text-sm rounded-2xl hover:bg-[#f9f0ff] transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {aiLoading ? (
                      <><div className="w-4 h-4 border-2 border-[#ce82ff] border-t-transparent rounded-full animate-spin" /> Asking AI...</>
                    ) : (
                      <>✨ Explain this to me</>
                    )}
                  </button>
                )}
                {aiExplanation && (
                  <div className="bg-[#f9f0ff] border-2 border-[#ce82ff] rounded-2xl p-4">
                    <p className="text-xs font-extrabold text-[#9d4edd] uppercase tracking-wider mb-2">✨ AI Tutor</p>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{aiExplanation}</p>
                    <button
                      onClick={() => setAiExplanation('')}
                      className="mt-2 text-xs text-[#9d4edd] font-bold hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}

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
          </>
        )}
      </div>
    </div>
  );
}
