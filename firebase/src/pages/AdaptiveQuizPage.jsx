import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAdaptiveQuestion, isAIConfigured } from '../services/aiService';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const MIN_LEVEL = 1;
const MAX_LEVEL = 10;

function StudyMascot({ mood = 'idle' }) {
  const faces = {
    idle:      { eyes: '◕ ◕', mouth: '⌣', color: '#1cb0f6', bg: '#ddf4ff', bounce: true },
    thinking:  { eyes: '◔ ◔', mouth: '…', color: '#ff9600', bg: '#fff3d6', bounce: false },
    correct:   { eyes: '◕ ◕', mouth: '‿', color: '#58CC02', bg: '#d7ffb8', bounce: true },
    wrong:     { eyes: '╥ ╥', mouth: '︿', color: '#ff4b4b', bg: '#ffdfe0', bounce: false },
    celebrate: { eyes: '★ ★', mouth: '‿', color: '#ce82ff', bg: '#f9f0ff', bounce: true },
  };
  const f = faces[mood] || faces.idle;
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      animation: f.bounce ? 'mascotBounce 0.6s ease-in-out infinite alternate' : 'none',
    }}>
      <style>{`
        @keyframes mascotBounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }
        @keyframes mascotPop { 0%{transform:scale(0.7)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
        .mascot-pop { animation: mascotPop 0.35s ease-out; }
      `}</style>
      <div className="mascot-pop" key={mood} style={{
        width: 56, height: 56, borderRadius: '50%',
        background: f.bg, border: `3px solid ${f.color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 900, color: f.color, lineHeight: 1.3, userSelect: 'none',
        boxShadow: `0 4px 0 ${f.color}`,
      }}>
        <span style={{ fontSize: 13 }}>{f.eyes}</span>
        <span style={{ fontSize: 16 }}>{f.mouth}</span>
      </div>
    </div>
  );
}

function DifficultyBar({ level }) {
  const pct = ((level - 1) / (MAX_LEVEL - 1)) * 100;
  const color =
    level <= 3 ? '#58CC02' :
    level <= 6 ? '#ffc800' :
    level <= 8 ? '#ff9600' : '#ff4b4b';
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <motion.div
        className="h-3 rounded-full"
        style={{ backgroundColor: color }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function AdaptiveQuizPage() {
  const navigate = useNavigate();

  // Setup phase
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [started, setStarted] = useState(false);
  const [questionsPerSession, setQuestionsPerSession] = useState(30);

  // Quiz state
  const [level, setLevel] = useState(5);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [questionNum, setQuestionNum] = useState(0);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [done, setDone] = useState(false);
  const [mascotMood, setMascotMood] = useState('idle');
  const [history, setHistory] = useState([]); // {question, correct, level}
  const previousQuestions = useRef([]);
  const prefetchedQuestion = useRef(null); // prefetched next question

  const fetchQuestion = async (currentLevel) => {
    setLoading(true);
    setError('');
    setSelected(null);
    setAnswered(false);
    setQuestion(null);

    // Use prefetched question if available and level matches
    const cached = prefetchedQuestion.current;
    if (cached && cached.level === currentLevel) {
      prefetchedQuestion.current = null;
      previousQuestions.current.push(cached.q.question);
      setQuestion(cached.q);
      setLoading(false);
      return;
    }
    prefetchedQuestion.current = null;

    setLoading(true);
    setError('');
    try {
      const q = await generateAdaptiveQuestion(
        topic,
        subtopic,
        currentLevel,
        previousQuestions.current
      );
      previousQuestions.current.push(q.question);
      setQuestion(q);
    } catch (e) {
      setError('Failed to generate question. ' + (e.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const prefetchQuestion = (nextLevel) => {
    // Fire-and-forget: fetch next question in the background
    generateAdaptiveQuestion(topic, subtopic, nextLevel, previousQuestions.current)
      .then(q => { prefetchedQuestion.current = { q, level: nextLevel }; })
      .catch(() => { prefetchedQuestion.current = null; });
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setStarted(true);
    setLevel(5);
    setQuestionNum(1);
    setScore({ correct: 0, incorrect: 0 });
    setHistory([]);
    previousQuestions.current = [];
    prefetchedQuestion.current = null;
    fetchQuestion(5);
  };

  const handleAnswer = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    // Trim + case-insensitive comparison as a safety net against AI whitespace/casing issues
    const normalize = s => s.trim().toLowerCase();
    const isCorrect = normalize(option) === normalize(question.answer);

    setMascotMood(isCorrect ? 'correct' : 'wrong');

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    setHistory(prev => [...prev, {
      question: question.question,
      answer: question.answer,
      selected: option,
      correct: isCorrect,
      level
    }]);

    // Adjust difficulty: correct → +1, wrong → -2 (clamped)
    const nextLevel = isCorrect
      ? Math.min(level + 1, MAX_LEVEL)
      : Math.max(level - 2, MIN_LEVEL);

    if (questionNum >= questionsPerSession) {
      setTimeout(() => { setMascotMood('celebrate'); setDone(true); }, 1800);
    } else {
      // Start prefetching the next question immediately during the 1.8s reveal
      prefetchQuestion(nextLevel);
      setTimeout(() => {
        setMascotMood('idle');
        setLevel(nextLevel);
        setQuestionNum(n => n + 1);
        fetchQuestion(nextLevel);
      }, 1800);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setDone(false);
    setQuestion(null);
    setHistory([]);
    previousQuestions.current = [];
    prefetchedQuestion.current = null;
    setScore({ correct: 0, incorrect: 0 });
    setLevel(5);
    setQuestionNum(0);
  };

  if (!isAIConfigured()) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🔑</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">AI Not Configured</h2>
          <p className="text-gray-500 font-bold">Add <code className="bg-gray-100 px-2 py-0.5 rounded">VITE_GEMINI_API_KEY</code> to your <code className="bg-gray-100 px-2 py-0.5 rounded">.env</code> file to use Adaptive Quiz.</p>
        </div>
      </div>
    );
  }

  // ── Setup Screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#1cb0f6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-gray-800">Adaptive Quiz</h1>
              <p className="text-gray-500 font-bold mt-1">Questions get harder when you're right, easier when you're wrong</p>
            </div>

            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-1.5 uppercase tracking-wide">Topic *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Japan, World War 2, Algebra, Biology..."
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1cb0f6] transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-1.5 uppercase tracking-wide">Focus Area <span className="text-gray-400 font-bold normal-case">(optional)</span></label>
                <input
                  type="text"
                  value={subtopic}
                  onChange={e => setSubtopic(e.target.value)}
                  placeholder="e.g. culture, capital cities, WWII Pacific theater..."
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1cb0f6] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-1.5 uppercase tracking-wide">Number of Questions</label>
                <div className="flex gap-3">
                  {[10, 20, 30].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuestionsPerSession(n)}
                      className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm border-2 border-b-4 transition ${
                        questionsPerSession === n
                          ? 'bg-[#1cb0f6] text-white border-[#1899d6]'
                          : 'bg-white text-gray-600 border-[#e5e5e5] hover:border-[#1cb0f6]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#f0f9ff] border-2 border-[#bae6fd] rounded-xl p-4 text-sm text-[#0369a1] font-bold">
                You'll get <strong>{questionsPerSession} questions</strong>. Starting at level 5/10 — answer correctly to go up, wrong to go down.
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#1cb0f6] hover:bg-[#1899d6] text-white font-extrabold text-lg rounded-xl border-b-4 border-[#1899d6] hover:border-[#157aad] transition active:border-b-0 active:mt-1"
              >
                START QUIZ
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Results Screen ────────────────────────────────────────────────────────
  if (done) {
    const accuracy = Math.round((score.correct / questionsPerSession) * 100);
    const avgLevel = history.length > 0
      ? (history.reduce((s, h) => s + h.level, 0) / history.length).toFixed(1)
      : level;
    const peakLevel = history.length > 0 ? Math.max(...history.map(h => h.level)) : level;

    // Knowledge score: each correct answer weighted by its difficulty level
    // Max possible = all correct at level 10 = questionsPerSession * MAX_LEVEL
    const weightedScore = history.filter(h => h.correct).reduce((sum, h) => sum + h.level, 0);
    const knowledgePct = Math.round((weightedScore / (questionsPerSession * MAX_LEVEL)) * 100);

    const knowledgeColor = knowledgePct >= 70 ? '#58CC02' : knowledgePct >= 40 ? '#ffc800' : '#ff4b4b';
    const knowledgeLabel = knowledgePct >= 80 ? 'Expert' : knowledgePct >= 60 ? 'Proficient' : knowledgePct >= 40 ? 'Developing' : 'Beginner';

    // SVG ring params
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (knowledgePct / 100) * circumference;

    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] overflow-hidden mb-6">
            <div className="bg-[#1cb0f6] p-8 text-center text-white">
              <div className="flex justify-center mb-3">
                <StudyMascot mood="celebrate" />
              </div>
              <h2 className="text-3xl font-black mb-1">Quiz Complete!</h2>
              <p className="text-[#bae6fd] font-bold">{topic}{subtopic ? ` · ${subtopic}` : ''}</p>
            </div>

            {/* Knowledge Score Ring */}
            <div className="flex flex-col items-center py-8 border-b border-gray-100">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Knowledge Score</p>
              <div className="relative w-36 h-36">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke={knowledgeColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.3s' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: knowledgeColor }}>{knowledgePct}%</span>
                  <span className="text-xs font-extrabold text-gray-400 mt-0.5">{knowledgeLabel}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-semibold mt-3 max-w-xs text-center">
                Correct answers weighted by difficulty — harder questions count more
              </p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100 text-center py-6">
              <div>
                <div className="text-2xl font-black text-[#58CC02]">{score.correct}/{questionsPerSession}</div>
                <div className="text-xs text-gray-500 mt-1 font-bold">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#1cb0f6]">{avgLevel}</div>
                <div className="text-xs text-gray-500 mt-1 font-bold">Avg Level</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#ff9600]">{peakLevel}</div>
                <div className="text-xs text-gray-500 mt-1 font-bold">Peak Level</div>
              </div>
            </div>
          </div>

          {/* Question breakdown */}
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-800">Question Breakdown</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {history.map((h, i) => (
                <div key={i} className={`flex items-start gap-3 px-5 py-4 ${h.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className="text-lg mt-0.5">{h.correct ? '🟢' : '🔴'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">{h.question}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Answer: <span className="font-bold text-gray-700">{h.answer}</span>
                      {!h.correct && <> · You said: <span className="font-bold text-red-600">{h.selected}</span></>}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-gray-400 shrink-0">Lv {h.level}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 py-3 bg-[#1cb0f6] hover:bg-[#1899d6] text-white font-extrabold rounded-xl border-b-4 border-[#1899d6] transition"
            >
              Try Another Topic
            </button>
            <button
              onClick={() => { setDone(false); handleStart({ preventDefault: () => {} }); }}
              className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-700 font-extrabold rounded-xl border-2 border-b-4 border-[#e5e5e5] transition"
            >
              Retry Same Topic
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Screen ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Progress header */}
        <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">{topic}{subtopic ? ` · ${subtopic}` : ''}</p>
              <p className="text-sm font-extrabold text-gray-700 mt-0.5">Question {questionNum} of {questionsPerSession}</p>
            </div>
            <StudyMascot mood={mascotMood} />
            <div className="text-right">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Difficulty</p>
              <p className="text-lg font-black text-gray-800">{level}<span className="text-sm text-gray-400">/10</span></p>
            </div>
          </div>
          <DifficultyBar level={level} />
          <div className="flex justify-between mt-2 text-xs font-bold text-gray-400">
            <span>Easier</span>
            <span className="text-[#58CC02]">{score.correct} correct</span>
            <span>Harder</span>
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-12 text-center"
            >
              <div className="w-12 h-12 border-4 border-[#1cb0f6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-bold">Generating question...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-8 text-center"
            >
              <p className="text-red-500 font-bold mb-4">{error}</p>
              <button
                onClick={() => fetchQuestion(level)}
                className="px-6 py-2 bg-[#1cb0f6] text-white font-extrabold rounded-xl"
              >
                Retry
              </button>
            </motion.div>
          ) : question ? (
            <motion.div
              key={questionNum}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Question */}
              <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-7 mb-4">
                <span className="text-xs font-extrabold text-[#1cb0f6] uppercase tracking-widest">Question {questionNum}</span>
                <p className="text-xl font-black text-gray-800 mt-2 leading-snug">{question.question}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {question.options.map((opt, i) => {
                  const norm = s => s.trim().toLowerCase();
                  const isCorrectOpt = norm(opt) === norm(question.answer);
                  const isSelectedOpt = norm(opt) === norm(selected || '');
                  let cls = 'w-full text-left px-5 py-4 rounded-2xl border-2 border-b-4 font-extrabold text-sm transition ';
                  if (!answered) {
                    cls += 'bg-white border-[#e5e5e5] hover:border-[#1cb0f6] hover:bg-[#f0f9ff] text-gray-800 cursor-pointer';
                  } else if (isCorrectOpt) {
                    cls += 'bg-[#d7ffb8] border-[#58CC02] text-[#46a302]';
                  } else if (isSelectedOpt) {
                    cls += 'bg-[#ffdfe0] border-[#ff4b4b] text-[#ea2b2b]';
                  } else {
                    cls += 'bg-white border-[#e5e5e5] text-gray-400 opacity-60';
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handleAnswer(opt)} disabled={answered}>
                      <span className="inline-block w-6 h-6 rounded-full border-2 border-current text-center text-xs leading-5 mr-3">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after answer */}
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 rounded-2xl border-2 p-5 ${selected === question.answer ? 'bg-[#d7ffb8] border-[#58CC02]' : 'bg-[#ffdfe0] border-[#ff4b4b]'}`}
                  >
                    <p className={`text-sm font-extrabold mb-1 ${selected === question.answer ? 'text-[#46a302]' : 'text-[#ea2b2b]'}`}>
                      {selected === question.answer ? '✓ Correct! Level going up →' : '✗ Incorrect. Level going down →'}
                    </p>
                    <p className="text-sm text-gray-700 font-bold">{question.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
