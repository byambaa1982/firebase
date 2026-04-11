import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getDueCards, getMasteryPercent } from '../utils/spacedRepetition';

// Get all user stats in one call
export async function getUserAnalytics(userId) {
  // Fetch decks, cards, and study sessions in parallel
  const [decks, cards, sessions] = await Promise.all([
    fetchUserDecks(userId),
    fetchUserCards(userId),
    fetchUserSessions(userId)
  ]);

  const dueCards = getDueCards(cards);
  const totalCards = cards.length;
  const totalDecks = decks.length;

  // Mastery distribution
  const mastery = { beginner: 0, learning: 0, mastered: 0 };
  cards.forEach(card => {
    const pct = getMasteryPercent(card);
    if (pct >= 80) mastery.mastered++;
    else if (pct >= 40) mastery.learning++;
    else mastery.beginner++;
  });

  // Deck breakdown
  const deckStats = decks.map(deck => {
    const deckCards = cards.filter(c => c.deckId === deck.id);
    const deckDue = getDueCards(deckCards);
    const avgMastery = deckCards.length > 0
      ? Math.round(deckCards.reduce((sum, c) => sum + getMasteryPercent(c), 0) / deckCards.length)
      : 0;
    return {
      id: deck.id,
      name: deck.name,
      category: deck.category,
      cardCount: deckCards.length,
      dueCount: deckDue.length,
      mastery: avgMastery
    };
  });

  // Study activity (last 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dailyActivity = buildDailyActivity(sessions, weekAgo, now);

  // Overall accuracy from sessions
  let totalCorrect = 0;
  let totalStudied = 0;
  sessions.forEach(s => {
    totalCorrect += s.correctCount || 0;
    totalStudied += s.cardsStudied || 0;
  });
  const accuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0;

  // Streak calculation
  const streak = calculateStreak(sessions);

  // Weekly streak map (last 7 days, true/false for each day)
  const streakWeek = buildStreakWeek(sessions);

  // Longest streak ever
  const longestStreak = calculateLongestStreak(sessions);

  // Study time (estimate from sessions)
  const totalStudyMinutes = estimateStudyTime(sessions);

  // Has studied today?
  const studiedToday = hasStudiedToday(sessions);

  return {
    totalDecks,
    totalCards,
    dueCards: dueCards.length,
    mastery,
    deckStats,
    dailyActivity,
    accuracy,
    streak,
    streakWeek,
    longestStreak,
    studiedToday,
    totalSessions: sessions.length,
    totalStudyMinutes,
    totalStudied,
    totalCorrect
  };
}

async function fetchUserDecks(userId) {
  const q = query(collection(db, 'decks'), where('createdBy', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function fetchUserCards(userId) {
  // Get all deck IDs first, then get cards for each
  const decks = await fetchUserDecks(userId);
  if (decks.length === 0) return [];

  // Firestore 'in' queries max 30 items at a time
  const allCards = [];
  const chunks = [];
  for (let i = 0; i < decks.length; i += 30) {
    chunks.push(decks.slice(i, i + 30).map(d => d.id));
  }

  for (const chunk of chunks) {
    const q = query(collection(db, 'cards'), where('deckId', 'in', chunk));
    const snap = await getDocs(q);
    snap.docs.forEach(d => allCards.push({ id: d.id, ...d.data() }));
  }
  return allCards;
}

async function fetchUserSessions(userId) {
  const q = query(collection(db, 'studySessions'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function buildDailyActivity(sessions, startDate, endDate) {
  const days = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMs)) {
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + dayMs);

    let cards = 0;
    let correct = 0;
    sessions.forEach(s => {
      const sDate = s.startedAt?.toDate?.() || new Date(s.startedAt);
      if (sDate >= dayStart && sDate < dayEnd) {
        cards += s.cardsStudied || 0;
        correct += s.correctCount || 0;
      }
    });

    days.push({
      day: dayNames[dayStart.getDay()],
      date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cards,
      correct
    });
  }
  return days;
}

function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  // Get unique study dates (sorted newest first)
  const dates = new Set();
  sessions.forEach(s => {
    const d = s.startedAt?.toDate?.() || new Date(s.startedAt);
    dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });

  const sorted = [...dates].sort().reverse();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  // Streak must include today or yesterday
  if (sorted[0] !== todayKey && sorted[0] !== yesterdayKey) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    // Check if consecutive
    const prev = sorted[i - 1].split('-').map(Number);
    const curr = sorted[i].split('-').map(Number);
    const prevDate = new Date(prev[0], prev[1], prev[2]);
    const currDate = new Date(curr[0], curr[1], curr[2]);
    const diff = prevDate.getTime() - currDate.getTime();
    if (diff <= 24 * 60 * 60 * 1000 + 1000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function estimateStudyTime(sessions) {
  let totalMs = 0;
  sessions.forEach(s => {
    if (s.startedAt && s.endedAt) {
      const start = s.startedAt?.toDate?.() || new Date(s.startedAt);
      const end = s.endedAt?.toDate?.() || new Date(s.endedAt);
      totalMs += end.getTime() - start.getTime();
    }
  });
  return Math.round(totalMs / 60000); // convert to minutes
}

function buildStreakWeek(sessions) {
  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Collect all unique study dates as date keys
  const studyDates = new Set();
  sessions.forEach(s => {
    const d = s.startedAt?.toDate?.() || new Date(s.startedAt);
    studyDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });

  const week = [];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * dayMs);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    week.push({
      dayLabel: dayNames[d.getDay()],
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      active: studyDates.has(key),
      isToday: i === 0
    });
  }
  return week;
}

function hasStudiedToday(sessions) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  return sessions.some(s => {
    const d = s.startedAt?.toDate?.() || new Date(s.startedAt);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayKey;
  });
}

function calculateLongestStreak(sessions) {
  if (sessions.length === 0) return 0;

  const dates = new Set();
  sessions.forEach(s => {
    const d = s.startedAt?.toDate?.() || new Date(s.startedAt);
    dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });

  const sorted = [...dates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].split('-').map(Number);
    const curr = sorted[i].split('-').map(Number);
    const prevDate = new Date(prev[0], prev[1], prev[2]);
    const currDate = new Date(curr[0], curr[1], curr[2]);
    const diff = currDate.getTime() - prevDate.getTime();
    if (diff <= 24 * 60 * 60 * 1000 + 1000) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}
