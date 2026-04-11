import React, { useState } from 'react';

export default function FlashcardFlip({ card, flipped, onFlip }) {
  return (
    <div
      className="w-full max-w-2xl mx-auto cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      onClick={onFlip}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '320px'
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-xs font-extrabold text-[#1cb0f6] uppercase tracking-widest mb-4">Question</span>
          <p className="text-2xl md:text-3xl font-black text-gray-800 text-center leading-relaxed">
            {card.front}
          </p>
          {card.hints && card.hints.length > 0 && (
            <HintButton hints={card.hints} />
          )}
          <span className="absolute bottom-5 text-xs font-bold text-gray-400">Tap to flip</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-[#d7ffb8] rounded-2xl border-2 border-b-4 border-[#58CC02] p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-xs font-extrabold text-[#58CC02] uppercase tracking-widest mb-4">Answer</span>
          <p className="text-2xl md:text-3xl font-black text-gray-800 text-center leading-relaxed">
            {card.back}
          </p>
          {card.explanation && (
            <p className="mt-4 text-sm text-gray-600 text-center font-semibold max-w-md">
              {card.explanation}
            </p>
          )}
          <span className="absolute bottom-5 text-xs font-bold text-[#46a302]">Tap to flip back</span>
        </div>
      </div>
    </div>
  );
}

function HintButton({ hints }) {
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!showHint) {
      setShowHint(true);
    } else if (hintIndex < hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

  return (
    <div className="mt-6 text-center">
      {showHint ? (
        <div className="bg-[#fff3d6] border-2 border-[#ff9600] rounded-2xl px-4 py-3 text-sm text-[#996000] font-bold">
          <span className="font-extrabold">Hint {hintIndex + 1}:</span> {hints[hintIndex]}
          {hintIndex < hints.length - 1 && (
            <button
              onClick={handleClick}
              className="ml-2 text-[#ff9600] hover:text-[#e08600] underline text-xs font-extrabold"
            >
              Next hint
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="text-sm text-[#ff9600] hover:text-[#e08600] font-extrabold flex items-center gap-1 mx-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Show hint
        </button>
      )}
    </div>
  );
}
