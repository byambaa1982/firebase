import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserAnalytics } from '../services/analyticsService';
import Navbar from '../components/Navbar';
import StreakDisplay from '../components/StreakDisplay';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#58CC02', '#1cb0f6', '#ffc800', '#ff4b4b'];

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getUserAnalytics(currentUser.uid)
      .then(setData)
      .catch(err => console.error('Analytics error:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-6 h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 font-bold">Failed to load analytics. Try refreshing.</p>
        </div>
      </div>
    );
  }

  const masteryData = [
    { name: 'Beginner', value: data.mastery.beginner },
    { name: 'Learning', value: data.mastery.learning },
    { name: 'Mastered', value: data.mastery.mastered }
  ].filter(d => d.value > 0);

  const accuracyData = data.dailyActivity.map(d => ({
    ...d,
    accuracy: d.cards > 0 ? Math.round((d.correct / d.cards) * 100) : 0
  }));

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm font-bold mt-1">Your study overview</p>
          </div>
          {data.dueCards > 0 && (
            <Link
              to="/decks"
              className="btn-duo btn-duo-green text-sm px-5 py-2.5"
            >
              REVIEW {data.dueCards} DUE CARD{data.dueCards !== 1 ? 'S' : ''}
            </Link>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🔥" label="Streak" value={`${data.streak} day${data.streak !== 1 ? 's' : ''}`} color="orange" />
          <StatCard icon="📚" label="Total Cards" value={data.totalCards} color="green" />
          <StatCard icon="🎯" label="Accuracy" value={`${data.accuracy}%`} color="blue" />
          <StatCard icon="⏱️" label="Study Time" value={formatTime(data.totalStudyMinutes)} color="purple" />
        </div>

        {/* Streak Panel */}
        <div className="mb-8">
          <StreakDisplay
            streak={data.streak}
            longestStreak={data.longestStreak}
            streakWeek={data.streakWeek}
            studiedToday={data.studiedToday}
          />
        </div>

        {/* Quick Actions */}
        {data.totalDecks === 0 && (
          <div className="bg-[#58CC02] rounded-2xl border-b-4 border-[#46a302] p-8 mb-8 text-white text-center">
            <h2 className="text-xl font-black mb-2">Get Started!</h2>
            <p className="text-green-100 text-sm font-bold mb-4">Create your first deck or generate cards with AI.</p>
            <div className="flex justify-center gap-3">
              <Link to="/decks" className="bg-white text-[#58CC02] font-extrabold text-sm px-5 py-2.5 rounded-2xl hover:bg-green-50 transition-colors border-b-4 border-gray-200">
                Create Deck
              </Link>
              <Link to="/ai-generate" className="bg-white/20 text-white font-extrabold text-sm px-5 py-2.5 rounded-2xl hover:bg-white/30 transition-colors border-b-4 border-white/10">
                AI Generate
              </Link>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Study Activity (Bar Chart) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-6">
            <h3 className="text-sm font-extrabold text-gray-800 mb-4">Study Activity (Last 7 days)</h3>
            {data.totalSessions > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="cards" name="Cards Studied" fill="#1cb0f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="correct" name="Correct" fill="#58CC02" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No study sessions yet. Start studying to see activity!
              </div>
            )}
          </div>

          {/* Mastery Breakdown (Pie Chart) */}
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-6">
            <h3 className="text-sm font-extrabold text-gray-800 mb-4">Card Mastery</h3>
            {masteryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={masteryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {masteryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {masteryData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No cards yet
              </div>
            )}
          </div>
        </div>

        {/* Accuracy Trend */}
        {data.totalSessions > 0 && (
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-6 mb-8">
            <h3 className="text-sm font-extrabold text-gray-800 mb-4">Accuracy Trend (Last 7 days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(v) => [`${v}%`, 'Accuracy']}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#58CC02" strokeWidth={2} dot={{ fill: '#58CC02', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Deck Breakdown */}
        {data.deckStats.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-6">
            <h3 className="text-sm font-extrabold text-gray-800 mb-4">Deck Progress</h3>
            <div className="space-y-3">
              {data.deckStats.map(deck => (
                <div key={deck.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link to={`/decks/${deck.id}/cards`} className="text-sm font-bold text-gray-800 hover:text-[#58CC02] truncate block">
                      {deck.name}
                    </Link>
                    <p className="text-xs text-gray-400">{deck.cardCount} cards · {deck.dueCount} due</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${deck.mastery}%`,
                          background: deck.mastery >= 80 ? '#58CC02' : deck.mastery >= 40 ? '#ffc800' : '#1cb0f6'
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-10 text-right">{deck.mastery}%</span>
                  </div>
                  <Link
                    to={`/decks/${deck.id}/study`}
                    className="btn-duo btn-duo-green text-xs px-4 py-2 shrink-0"
                  >
                    STUDY
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const styles = {
    orange: { bg: 'bg-[#fff3d6]', border: 'border-[#ff9600]' },
    green: { bg: 'bg-[#d7ffb8]', border: 'border-[#58CC02]' },
    blue: { bg: 'bg-[#ddf4ff]', border: 'border-[#1cb0f6]' },
    purple: { bg: 'bg-[#f3e8ff]', border: 'border-[#ce82ff]' }
  }[color] || { bg: 'bg-gray-50', border: 'border-[#e5e5e5]' };

  return (
    <div className={`bg-white rounded-2xl border-2 border-b-4 ${styles.border} p-5`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm ${styles.bg}`}>{icon}</span>
        <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  );
}

function formatTime(minutes) {
  if (minutes < 1) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
