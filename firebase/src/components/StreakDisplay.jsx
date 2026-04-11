import React from 'react';

/*
 * CardSparks streak palette — purple theme
 * Active:  #8B5CF6 (vivid purple)         → dark: #7C3AED
 * Glow:    #DDD6FE (soft lavender)
 * Idle:    #E8E8E8 (cool gray)
 * Ring:    #C4B5FD (light violet)
 */

const STREAK = {
  active:   '#8B5CF6',
  dark:     '#7C3AED',
  glow:     '#DDD6FE',
  bg:       '#F5F3FF',
  idle:     '#E8E8E8',
  idleText: '#B0B0B0',
  ring:     '#C4B5FD',
};

/* Flame icon drawn as SVG — unique multi-tone flame */
function FlameIcon({ size = 28, lit = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer flame */}
      <path
        d="M16 2C16 2 8 12 8 20a8 8 0 0016 0c0-8-8-18-8-18z"
        fill={lit ? STREAK.active : STREAK.idle}
      />
      {/* Inner bright core */}
      <path
        d="M16 12c0 0-4 5-4 10a4 4 0 008 0c0-5-4-10-4-10z"
        fill={lit ? '#C4B5FD' : '#D4D4D4'}
      />
      {/* Hot center */}
      <ellipse cx="16" cy="24" rx="1.8" ry="2.5" fill={lit ? '#EDE9FE' : '#E8E8E8'} />
    </svg>
  );
}

/* ── Mini streak badge (Navbar) ── */
export function StreakBadge({ streak = 0, studiedToday = false }) {
  if (streak <= 0) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl cursor-default select-none"
      style={{
        background: studiedToday ? STREAK.bg : 'transparent',
        border: `2px solid ${studiedToday ? STREAK.ring : STREAK.idle}`,
      }}
      title={`${streak} day streak${studiedToday ? '' : ' — study today to keep it!'}`}
    >
      <FlameIcon size={18} lit={studiedToday} />
      <span
        className="text-sm font-black tabular-nums"
        style={{ color: studiedToday ? STREAK.active : STREAK.idleText }}
      >
        {streak}
      </span>
    </div>
  );
}

/* ── Full streak panel (Dashboard) ── */
export default function StreakDisplay({ streak = 0, longestStreak = 0, streakWeek = [], studiedToday = false }) {
  return (
    <div
      className="rounded-2xl border-2 border-b-4 p-6 transition-all"
      style={{
        background: studiedToday ? STREAK.bg : '#fff',
        borderColor: studiedToday ? STREAK.ring : '#e5e5e5',
      }}
    >
      {/* Top row: flame + count */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: studiedToday ? STREAK.glow : '#f5f5f5',
              boxShadow: studiedToday ? `0 0 20px ${STREAK.glow}` : 'none',
            }}
          >
            <FlameIcon size={32} lit={studiedToday} />
          </div>
          <div>
            <div
              className="text-3xl font-black tabular-nums leading-none"
              style={{ color: streak > 0 ? STREAK.active : '#999' }}
            >
              {streak}
            </div>
            <div className="text-xs font-extrabold uppercase tracking-wider mt-0.5" style={{ color: streak > 0 ? STREAK.dark : '#aaa' }}>
              Day Streak
            </div>
          </div>
        </div>

        {/* Longest streak pill */}
        {longestStreak > 0 && (
          <div
            className="text-center px-4 py-2 rounded-xl"
            style={{ background: '#f5f5f5' }}
          >
            <div className="text-lg font-black text-gray-700 leading-none">{longestStreak}</div>
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mt-0.5">Best</div>
          </div>
        )}
      </div>

      {/* Weekly dots */}
      <div className="flex items-center justify-between gap-1">
        {streakWeek.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: day.active ? STREAK.active : '#f0f0f0',
                border: day.isToday ? `3px solid ${day.active ? STREAK.dark : STREAK.ring}` : '3px solid transparent',
                boxShadow: day.active && day.isToday ? `0 0 12px ${STREAK.glow}` : 'none',
              }}
              title={day.date}
            >
              {day.active ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="w-2 h-2 rounded-full" style={{ background: STREAK.idle }} />
              )}
            </div>
            <span
              className="text-[10px] font-extrabold"
              style={{ color: day.isToday ? STREAK.active : '#aaa' }}
            >
              {day.dayLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Motivational nudge */}
      {!studiedToday && streak > 0 && (
        <div
          className="mt-4 text-center text-xs font-extrabold py-2.5 rounded-xl"
          style={{ background: '#EDE9FE', color: STREAK.dark }}
        >
          ⚡ Study today to keep your {streak}-day streak alive!
        </div>
      )}
      {studiedToday && (
        <div
          className="mt-4 text-center text-xs font-extrabold py-2.5 rounded-xl"
          style={{ background: STREAK.glow, color: STREAK.dark }}
        >
          ✅ You've studied today — nice work!
        </div>
      )}
    </div>
  );
}
