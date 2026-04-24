import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateFromText, generateFromTopic, isAIConfigured } from '../services/aiService';
import { createDeck } from '../services/deckService';
import { createCard } from '../services/cardService';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker to avoid CORS issues
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const TABS = { TEXT: 'text', TOPIC: 'topic', PDF: 'pdf' };

export default function AIGeneratePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(TABS.TEXT);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedCards, setGeneratedCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [editingIndex, setEditingIndex] = useState(null);
  const [aiConfigured, setAiConfigured] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Text mode
  const [textInput, setTextInput] = useState('');
  const [textCount, setTextCount] = useState(10);

  // Topic mode
  const [topic, setTopic] = useState('');
  const [topicCount, setTopicCount] = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');
  const [focus, setFocus] = useState('');

  // PDF mode
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfCount, setPdfCount] = useState(10);
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const pdfInputRef = useRef(null);

  // Save to deck
  const [deckName, setDeckName] = useState('');
  const [deckCategory, setDeckCategory] = useState('General');

  useEffect(() => {
    setAiConfigured(isAIConfigured());
  }, []);

  const handleGenerate = async () => {
    if (generating) return;

    if (activeTab === TABS.TEXT && !textInput.trim()) {
      toast.error('Paste some text first');
      return;
    }
    if (activeTab === TABS.TOPIC && !topic.trim()) {
      toast.error('Enter a topic');
      return;
    }
    if (activeTab === TABS.PDF && !pdfFile) {
      toast.error('Upload a PDF first');
      return;
    }

    setGenerating(true);
    setGeneratedCards([]);
    setSelectedCards(new Set());
    setErrorMsg('');

    try {
      let cards;
      if (activeTab === TABS.TEXT) {
        cards = await generateFromText(textInput, textCount);
      } else if (activeTab === TABS.PDF) {
        setPdfExtracting(true);
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        setPdfExtracting(false);
        if (!fullText.trim()) {
          toast.error('Could not extract text from this PDF');
          setGenerating(false);
          return;
        }
        cards = await generateFromText(fullText, pdfCount);
      } else {
        cards = await generateFromTopic(topic, topicCount, difficulty, focus);
      }

      if (!cards || cards.length === 0) {
        setErrorMsg('AI returned no cards. Try a different topic or text.');
        return;
      }

      setGeneratedCards(cards);
      setSelectedCards(new Set(cards.map((_, i) => i)));
      setDeckName(activeTab === TABS.TOPIC ? topic : 'AI Generated Deck');
      toast.success(`Generated ${cards.length} cards!`);
    } catch (error) {
      console.error('AI generation error:', error);
      const msg = error.message || 'Failed to generate cards';
      setErrorMsg(msg);
      toast.error(msg, { duration: 6000 });
    } finally {
      setGenerating(false);
    }
  };

  const toggleCard = (index) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedCards.size === generatedCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(generatedCards.map((_, i) => i)));
    }
  };

  const updateCard = (index, field, value) => {
    setGeneratedCards(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    const selected = generatedCards.filter((_, i) => selectedCards.has(i));
    if (selected.length === 0) {
      toast.error('Select at least one card');
      return;
    }
    if (!deckName.trim()) {
      toast.error('Enter a deck name');
      return;
    }

    setSaving(true);
    try {
      // Create deck
      const deck = await createDeck(currentUser.uid, {
        name: deckName,
        description: `AI-generated deck with ${selected.length} cards`,
        category: deckCategory,
        isPublic: false
      });

      // Create all cards
      await Promise.all(selected.map(card =>
        createCard(deck.id, {
          front: card.front,
          back: card.back,
          hints: card.hints || [],
          difficulty: card.difficulty || 'medium',
          explanation: card.explanation || ''
        })
      ));

      toast.success(`Saved ${selected.length} cards to "${deckName}"!`);
      navigate(`/decks/${deck.id}/cards`);
    } catch (error) {
      console.error('Error saving cards:', error);
      toast.error('Failed to save cards: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // ---- NOT CONFIGURED ----
  if (!aiConfigured) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-12">
            <div className="text-6xl mb-4">🔑</div>
            <h2 className="text-2xl font-black text-gray-800 mb-3">Gemini API Key Required</h2>
            <p className="text-gray-500 font-bold mb-6">
              To use AI features, add your Google Gemini API key to the <code className="bg-gray-100 px-2 py-1 rounded text-sm">.env</code> file:
            </p>
            <div className="bg-gray-900 text-green-400 rounded-xl p-4 text-left text-sm font-mono mb-6">
              VITE_GEMINI_API_KEY=your-key-here
            </div>
            <p className="text-xs text-gray-400">
              Get a free API key at <span className="text-[#1cb0f6] font-bold">aistudio.google.com/apikey</span>. Then restart the dev server.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <span className="bg-[#ce82ff] text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl">✨</span>
            AI Card Generator
          </h1>
          <p className="text-gray-500 font-bold mt-2">Generate flashcards from your notes or any topic using AI.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: Input Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] overflow-hidden sticky top-24">
              {/* Tabs */}
              <div className="flex border-b-2 border-[#e5e5e5]">
                <button
                  onClick={() => setActiveTab(TABS.TEXT)}
                  className={`flex-1 py-4 text-sm font-extrabold transition ${activeTab === TABS.TEXT ? 'text-[#1cb0f6] border-b-2 border-[#1cb0f6] bg-[#ddf4ff]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  📝 From Text
                </button>
                <button
                  onClick={() => setActiveTab(TABS.TOPIC)}
                  className={`flex-1 py-4 text-sm font-extrabold transition ${activeTab === TABS.TOPIC ? 'text-[#1cb0f6] border-b-2 border-[#1cb0f6] bg-[#ddf4ff]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  💡 From Topic
                </button>
                <button
                  onClick={() => setActiveTab(TABS.PDF)}
                  className={`flex-1 py-4 text-sm font-extrabold transition ${activeTab === TABS.PDF ? 'text-[#1cb0f6] border-b-2 border-[#1cb0f6] bg-[#ddf4ff]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  📄 From PDF
                </button>
              </div>

              <div className="p-6 space-y-4">
                {activeTab === TABS.TEXT ? (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Paste your notes</label>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        rows={10}
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:ring-2 focus:ring-[#1cb0f6] focus:border-[#1cb0f6] outline-none resize-none text-sm"
                        placeholder="Paste lecture notes, textbook content, or any study material here..."
                        disabled={generating}
                      />
                      <p className="text-xs text-gray-400 mt-1">{textInput.length} characters</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Number of cards</label>
                      <select
                        value={textCount}
                        onChange={(e) => setTextCount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 border-2 border-[#e5e5e5] rounded-2xl text-sm bg-white"
                        disabled={generating}
                      >
                        {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} cards</option>)}
                      </select>
                    </div>
                  </>
                ) : activeTab === TABS.PDF ? (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Upload PDF</label>
                      <div
                        onClick={() => pdfInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-[#1cb0f6] rounded-2xl p-8 text-center cursor-pointer hover:bg-[#f0faff] transition"
                      >
                        {pdfFile ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">📄</span>
                            <p className="text-sm font-bold text-gray-700">{pdfFile.name}</p>
                            <p className="text-xs text-gray-400">{(pdfFile.size / 1024).toFixed(0)} KB — click to change</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-4xl">📤</span>
                            <p className="text-sm font-bold text-gray-600">Click to upload a PDF</p>
                            <p className="text-xs text-gray-400">Notes, textbooks, articles...</p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setPdfFile(file);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Number of cards</label>
                      <select
                        value={pdfCount}
                        onChange={(e) => setPdfCount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 border-2 border-[#e5e5e5] rounded-2xl text-sm bg-white"
                        disabled={generating}
                      >
                        {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} cards</option>)}
                      </select>
                    </div>
                    {pdfExtracting && (
                      <p className="text-xs text-[#1cb0f6] font-bold animate-pulse">Extracting text from PDF...</p>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
                      <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:ring-2 focus:ring-[#1cb0f6] focus:border-[#1cb0f6] outline-none text-sm"
                        placeholder="e.g. Photosynthesis, World War II, Python loops..."
                        disabled={generating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Focus area (optional)</label>
                      <input
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                        className="w-full px-2.5 py-2.5 border-2 border-[#e5e5e5] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#1cb0f6] focus:border-[#1cb0f6]"
                        placeholder="e.g. light reactions, causes, for-loops..."
                        disabled={generating}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cards</label>
                        <select
                          value={topicCount}
                          onChange={(e) => setTopicCount(Number(e.target.value))}
                          className="w-full px-3 py-2.5 border-2 border-[#e5e5e5] rounded-2xl text-sm bg-white"
                          disabled={generating}
                        >
                          {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="w-full px-3 py-2.5 border-2 border-[#e5e5e5] rounded-2xl text-sm bg-white"
                          disabled={generating}
                        >
                          <option value="mixed">Mixed</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full btn-duo btn-duo-green text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>✨ Generate Cards</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Generated Cards / Preview */}
          <div className="lg:col-span-3">
            {generatedCards.length === 0 && !generating ? (
              <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-12 text-center">
                <div className="text-6xl mb-4">{errorMsg ? '⚠️' : '🤖'}</div>
                <h3 className="text-xl font-black text-gray-800 mb-2">
                  {errorMsg ? 'Generation Failed' : 'Ready to Generate'}
                </h3>
                {errorMsg ? (
                  <div className="text-red-600 text-sm max-w-md mx-auto bg-red-50 rounded-lg p-4">
                    {errorMsg}
                    <p className="text-gray-500 mt-2 text-xs">Check the browser console (F12) for more details.</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">
                    Paste your notes or enter a topic, then click Generate. AI will create flashcards for you to review and save.
                  </p>
                )}
              </div>
            ) : generating ? (
              <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-12 text-center">
                <div className="w-16 h-16 border-4 border-[#ce82ff] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-black text-gray-800 mb-2">AI is thinking...</h3>
                <p className="text-gray-500 text-sm font-bold">Generating your flashcards. This usually takes 5-15 seconds.</p>
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleAll}
                      className="text-sm font-extrabold text-[#1cb0f6] hover:text-[#0d8ecf]"
                    >
                      {selectedCards.size === generatedCards.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-sm text-gray-400">
                      {selectedCards.size} of {generatedCards.length} selected
                    </span>
                  </div>
                </div>

                {/* Card List */}
                <div className="space-y-3 mb-6">
                  {generatedCards.map((card, i) => (
                    <div
                      key={i}
                      className={`bg-white rounded-2xl border-2 border-b-4 overflow-hidden transition-all ${
                        selectedCards.has(i) ? 'border-[#58CC02]' : 'border-[#e5e5e5] opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3 p-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleCard(i)}
                          className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition ${
                            selectedCards.has(i) ? 'bg-[#58CC02] border-[#58CC02] text-white' : 'border-gray-300 hover:border-[#58CC02]'
                          }`}
                        >
                          {selectedCards.has(i) && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        {/* Card Content */}
                        <div className="flex-1 min-w-0">
                          {editingIndex === i ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">QUESTION</label>
                                <textarea
                                  value={card.front}
                                  onChange={(e) => updateCard(i, 'front', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-[#e5e5e5] rounded-xl text-sm resize-none"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">ANSWER</label>
                                <textarea
                                  value={card.back}
                                  onChange={(e) => updateCard(i, 'back', e.target.value)}
                                  className="w-full px-3 py-2 border-2 border-[#e5e5e5] rounded-xl text-sm resize-none"
                                  rows={2}
                                />
                              </div>
                              <button
                                onClick={() => setEditingIndex(null)}
                                className="text-sm font-extrabold text-[#1cb0f6] hover:text-[#0d8ecf]"
                              >
                                Done editing
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-bold text-gray-800 mb-1">{card.front}</p>
                              <p className="text-sm text-gray-500">{card.back}</p>
                              {card.explanation && (
                                <p className="text-xs text-gray-400 mt-1 italic">{card.explanation}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                  card.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  card.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {card.difficulty}
                                </span>
                                {card.hints?.length > 0 && (
                                  <span className="text-xs text-gray-400">
                                    {card.hints.length} hint{card.hints.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Edit button */}
                        {editingIndex !== i && (
                          <button
                            onClick={() => setEditingIndex(i)}
                            className="text-gray-400 hover:text-[#1cb0f6] transition p-1"
                            title="Edit card"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Panel */}
                <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-6">
                  <h3 className="font-black text-gray-800 mb-4">Save to New Deck</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Deck Name</label>
                      <input
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-[#e5e5e5] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#1cb0f6] focus:border-[#1cb0f6]"
                        placeholder="My AI Deck"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Category</label>
                      <select
                        value={deckCategory}
                        onChange={(e) => setDeckCategory(e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-[#e5e5e5] rounded-2xl text-sm bg-white"
                      >
                        {['General', 'Science', 'Math', 'History', 'Language', 'Geography', 'Art', 'Music', 'Programming', 'Other'].map(c =>
                          <option key={c} value={c}>{c}</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving || selectedCards.size === 0}
                    className="w-full btn-duo btn-duo-green text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>💾 Save {selectedCards.size} Cards to Deck</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
