# CardSparks — AI-Powered Flashcard Study Platform
## Full Project Plan

---

## Vision

CardSparks is an AI-powered flashcard platform that helps students study smarter. Users paste notes, upload documents, or describe a topic — and AI instantly generates study-ready flashcards. During study sessions, AI acts as a personal tutor: explaining wrong answers, providing hints, adapting difficulty, and optimizing review schedules. The app learns how each user studies and tailors the experience to maximize retention.

---

## Current State (Already Built)

| Feature | Status |
|---------|--------|
| Firebase project + config | ✅ |
| Email/Password + Google OAuth | ✅ |
| AuthContext + ProtectedRoute | ✅ |
| User profiles in Firestore | ✅ |
| Navbar + responsive layout | ✅ |
| Deck CRUD (create, edit, delete) | ✅ |
| Real-time Firestore deck sync | ✅ |
| Deck search + category filtering | ✅ |
| DeckCard, DeckForm components | ✅ |
| HomePage + LoginPage + ProfilePage | ✅ |

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                  │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌───────────┐  │
│  │  Auth     │ │  Decks &  │ │  Study     │ │  AI Chat  │  │
│  │  Pages    │ │  Cards    │ │  Session   │ │  Tutor    │  │
│  └──────────┘ └───────────┘ └────────────┘ └───────────┘  │
└─────────────────────┬──────────────────────────────────────┘
                      │
         ┌────────────┼────────────────┐
         ▼            ▼                ▼
   ┌──────────┐ ┌──────────┐   ┌─────────────┐
   │ Firebase │ │ Firebase │   │  AI Backend  │
   │ Auth     │ │ Firestore│   │  (Cloud Fn   │
   │          │ │ Storage  │   │  + OpenAI)   │
   └──────────┘ └──────────┘   └─────────────┘
```

### AI Backend Options (Pick One)

| Option | Pros | Cons |
|--------|------|------|
| **A) Firebase Cloud Functions + OpenAI API** | Stays in Firebase ecosystem, serverless, auto-scales | Requires Blaze plan ($), cold starts |
| **B) Separate Express/Node.js API on Railway/Render** | Free tier available, full control, easy to debug | Extra service to manage |
| **C) Vercel Edge Functions + OpenAI API** | Fast, generous free tier, easy deployment | Separate from Firebase hosting |

**Recommendation:** Option A (Firebase Cloud Functions) for tightest integration, or Option B if you want to stay on Firebase's free Spark plan and host the AI API separately.

---

## Tech Stack Additions

| Category | Technology | Purpose |
|----------|-----------|---------|
| AI | OpenAI API (GPT-4o-mini) | Flashcard generation, explanations, tutoring |
| AI Backend | Firebase Cloud Functions (Node.js) | Secure API proxy for OpenAI calls |
| PDF Parsing | pdf-parse (npm) | Extract text from uploaded PDFs |
| Markdown | react-markdown | Rich card content rendering |
| Animations | framer-motion | Card flip, transitions |
| Charts | recharts | Analytics dashboard |
| Drag & Drop | @dnd-kit/core | Card reordering |
| State Mgmt | React Context (existing) | Global state |

---

## Firestore Schema (Updated for AI)

```
users/{userId}
  ├── email, displayName, createdAt
  ├── stats: { totalDecks, totalCards, studySessions, streak }
  ├── aiUsage: { tokensUsedToday, lastResetDate }
  └── preferences: { dailyGoal, studyReminders, theme }

decks/{deckId}
  ├── name, description, category, isPublic
  ├── createdBy, createdAt, updatedAt
  ├── cardCount
  ├── aiGenerated: boolean          ← NEW
  └── sourceType: "manual" | "ai-text" | "ai-document" | "ai-topic"  ← NEW

cards/{cardId}
  ├── deckId, front, back, imageUrl
  ├── createdAt, difficulty
  ├── aiGenerated: boolean          ← NEW
  ├── explanation: string           ← NEW (AI-generated explanation)
  ├── hints: string[]               ← NEW (progressive hints)
  ├── tags: string[]                ← NEW
  └── spacedRepetition: {           ← NEW
        interval, easeFactor, nextReviewDate,
        timesReviewed, timesCorrect
      }

studySessions/{sessionId}            ← NEW collection
  ├── userId, deckId
  ├── startedAt, endedAt
  ├── cardsStudied, correctCount, incorrectCount
  ├── aiInteractions: number
  └── performanceScore: number

aiConversations/{conversationId}      ← NEW collection
  ├── userId, deckId, cardId
  ├── messages: [{ role, content, timestamp }]
  └── createdAt
```

---

## Phase 2: Flashcard Management (Next Up)

> Build the card-level CRUD that sits inside each deck.

### 2.1 Card Management Pages & Components
- [ ] `CardsPage.jsx` — View all cards in a deck (grid + list view toggle)
- [ ] `CardForm.jsx` — Create/edit a single card (front, back, hints, image)
- [ ] `CardPreview.jsx` — Flip-card preview component
- [ ] `services/cardService.js` — Firestore CRUD for cards

### 2.2 Card Operations
- [ ] Add card to deck
- [ ] Edit card (front, back, hints, explanation)
- [ ] Delete card (with confirmation)
- [ ] Bulk delete selected cards
- [ ] Duplicate card
- [ ] Move card to another deck

### 2.3 Bulk Import
- [ ] CSV import (front, back columns)
- [ ] JSON import
- [ ] Copy-paste from spreadsheet

### 2.4 Card Organization
- [ ] Search cards within a deck
- [ ] Filter by difficulty (Easy / Medium / Hard)
- [ ] Sort by date, alphabetical, difficulty
- [ ] Drag-and-drop reorder with @dnd-kit

### Deliverables
- Users can fully manage cards inside decks
- Bulk import from CSV/JSON
- Search, filter, sort, reorder cards

---

## Phase 3: AI-Powered Card Generation (Core AI Feature)

> The headline feature — AI creates flashcards for you.

### 3.1 AI Backend Setup
- [ ] Set up Firebase Cloud Functions (or Express API)
- [ ] Create `/api/ai/generate-cards` endpoint
- [ ] Integrate OpenAI API (GPT-4o-mini for cost efficiency)
- [ ] Implement rate limiting (e.g., 50 AI generations/day per user)
- [ ] Add API key security (never expose key to frontend)
- [ ] Create `services/aiService.js` on the frontend

### 3.2 Generate Cards from Text/Notes
- [ ] `AIGeneratePage.jsx` — Main AI generation interface
- [ ] Text input area where users paste notes, lecture content, or textbook excerpts
- [ ] AI parses the text and generates question-answer flashcard pairs
- [ ] User can preview generated cards before saving
- [ ] Edit any generated card before adding to deck
- [ ] Select which cards to keep, discard, or regenerate

**Prompt engineering example:**
```
System: You are a flashcard generator for students. Given the following 
study material, create {count} flashcards as JSON. Each card should have:
- "front": A clear, specific question
- "back": A concise, accurate answer  
- "explanation": A brief explanation of why this is important
- "hints": An array of 1-2 progressive hints
- "difficulty": "easy", "medium", or "hard"

Focus on key concepts, definitions, and relationships. Vary question 
types: definitions, comparisons, cause-effect, applications.
```

### 3.3 Generate Cards from Topic
- [ ] "Generate from Topic" mode — user types a subject (e.g., "Photosynthesis")
- [ ] Select difficulty level and card count (5, 10, 15, 20)
- [ ] AI generates comprehensive cards covering the topic
- [ ] Option to specify focus areas or exclude subtopics

### 3.4 Generate Cards from Document Upload
- [ ] Upload PDF, DOCX, or TXT files
- [ ] Extract text from uploaded documents (pdf-parse, mammoth.js)
- [ ] Upload file to Firebase Storage, process via Cloud Function
- [ ] AI generates cards from extracted content
- [ ] Show extraction preview before generating

### 3.5 Smart Card Enhancement
- [ ] "Improve this card" button on any existing card
- [ ] AI rewrites vague questions to be more specific
- [ ] AI adds hints and explanations to manual cards
- [ ] AI suggests related cards to fill knowledge gaps

### 3.6 AI Generation UI
- [ ] Generation loading state with progress animation
- [ ] Card preview carousel (swipe through generated cards)
- [ ] Select All / Deselect All / Individual toggles
- [ ] "Add to Deck" or "Create New Deck" options
- [ ] Generation history (recent AI generations)

### Deliverables
- Users can generate flashcards from pasted text, topic names, or uploaded documents
- Preview, edit, and selectively save AI-generated cards
- Rate limiting protects against abuse
- AI enhances existing manually-created cards

---

## Phase 4: Study Mode + AI Tutor

> Interactive study sessions with an AI tutor that explains, hints, and adapts.

### 4.1 Study Session Interface
- [ ] `StudyPage.jsx` — Full-screen study mode
- [ ] `FlashcardFlip.jsx` — Animated flip card (framer-motion)
- [ ] Card flip animation (click or spacebar)
- [ ] Progress bar (card X of Y)
- [ ] Session timer
- [ ] Keyboard shortcuts: Space (flip), → (next), ← (prev), H (hint)

### 4.2 Self-Assessment Controls
- [ ] After revealing answer, rate your confidence:
  - 🔴 **Didn't Know** — Show again soon
  - 🟡 **Partially Knew** — Show again later
  - 🟢 **Knew It** — Increase interval
- [ ] Response feeds into spaced repetition algorithm

### 4.3 Spaced Repetition (SM-2 Algorithm)
- [ ] `utils/spacedRepetition.js` — SM-2 implementation
- [ ] Calculate next review date per card based on:
  - Number of consecutive correct answers
  - Current ease factor
  - User's self-rating
- [ ] "Due for Review" queue — cards whose nextReviewDate ≤ today
- [ ] `services/progressService.js` — Save progress to Firestore

### 4.4 AI Tutor During Study (Key Differentiator)
- [ ] **"Explain" button** — AI explains the answer in detail when user gets it wrong
- [ ] **"Hint" button** — AI provides a progressive hint without revealing the answer
- [ ] **"Why is this important?"** — AI provides context on why this concept matters
- [ ] **"Give me an example"** — AI provides a real-world example or analogy
- [ ] **"Quiz me differently"** — AI rephrases the question in a new way
- [ ] Inline AI chat panel that slides in from the side
- [ ] Conversation context is card-aware (AI knows the current card's content)

**Tutor prompt engineering:**
```
System: You are a friendly study tutor helping a student learn. 
The student is studying a flashcard:
- Question: {front}
- Answer: {back}

The student got this {correct/wrong}. Help them understand by:
1. Explaining the concept simply
2. Using analogies or real-world examples
3. Connecting it to related concepts
4. Being encouraging and supportive

Keep responses concise (2-3 sentences) unless asked to elaborate.
```

### 4.5 Study Modes
- [ ] **Standard Mode** — All cards, sequential
- [ ] **Smart Review** — Only cards due for spaced repetition review
- [ ] **AI Adaptive** — AI adjusts difficulty and card order based on performance
- [ ] **Quick Quiz** — AI generates multiple-choice questions from card content
- [ ] **Shuffle Mode** — Randomized order

### 4.6 Study Session Summary
- [ ] End-of-session results screen
- [ ] Cards correct vs incorrect
- [ ] Time spent
- [ ] Weakest cards highlighted
- [ ] AI-generated study tips based on performance
- [ ] "Continue studying weak cards" option

### Deliverables
- Smooth study experience with flip animations
- SM-2 spaced repetition drives review scheduling
- AI tutor provides real-time explanations, hints, and examples
- Multiple study modes including AI-adaptive
- Session summaries with actionable insights

---

## Phase 5: Analytics & Dashboard

> Help users understand their learning patterns and progress.

### 5.1 Dashboard Page
- [ ] `DashboardPage.jsx` — Central analytics hub
- [ ] Study streak counter (calendar heatmap)
- [ ] Cards due today / this week
- [ ] Daily study goal progress ring
- [ ] Quick-start: "Resume studying" / "Review due cards"

### 5.2 Statistics & Charts (recharts)
- [ ] Study activity over time (bar chart — cards per day)
- [ ] Accuracy rate trend (line chart)
- [ ] Deck mastery breakdown (pie/donut chart)
- [ ] Time spent studying per deck
- [ ] Card difficulty distribution
- [ ] Spaced repetition intervals overview

### 5.3 AI Study Insights
- [ ] Weekly AI-generated study summary
  - "You studied 142 cards this week, up 23% from last week"
  - "Your weakest topic is Organic Chemistry — consider reviewing Chapter 5 cards"
  - "You're on a 7-day streak! Keep it up."
- [ ] Recommended next study session (which deck, how many cards)
- [ ] Predicted mastery date per deck

### 5.4 Gamification
- [ ] Daily study streak tracking
- [ ] Achievement badges (first deck, 100 cards studied, 7-day streak, etc.)
- [ ] XP system — earn points for studying, bonus for streaks
- [ ] Level progression
- [ ] Weekly leaderboard (optional, for public decks)

### Deliverables
- Visual dashboard showing study progress
- AI-generated weekly insights and recommendations
- Gamification elements to drive engagement

---

## Phase 6: Social Features & Public Library

> Share decks, browse community content, and study together.

### 6.1 Public Deck Library
- [ ] `BrowseDecksPage.jsx` — Discover public decks
- [ ] Search by keyword, category, popularity
- [ ] Sort by: newest, most popular, highest rated
- [ ] Featured/trending decks section
- [ ] Clone a public deck to your library

### 6.2 Deck Sharing
- [ ] Share deck via link
- [ ] Set deck visibility: Private / Public / Unlisted (link only)
- [ ] View count and clone count on public decks

### 6.3 Ratings & Reviews
- [ ] 5-star rating on public decks
- [ ] Written reviews
- [ ] Report inappropriate content

### Deliverables
- Community deck library
- Sharing and discovery features
- Rating system for quality content

---

## Phase 7: Polish, Performance & Deployment

> Final hardening, optimization, and launch.

### 7.1 UI/UX Polish
- [ ] Dark mode toggle
- [ ] Consistent design system (colors, spacing, typography)
- [ ] Mobile-first responsive design audit
- [ ] Loading skeletons on all pages
- [ ] Error boundaries with friendly error pages
- [ ] Accessibility audit (ARIA labels, keyboard nav, contrast)
- [ ] Toast notifications for all actions

### 7.2 Performance
- [ ] Code splitting with React.lazy() + Suspense
- [ ] Image optimization (WebP, lazy loading)
- [ ] Firestore query optimization (indexes, pagination)
- [ ] Bundle analysis and tree-shaking
- [ ] Service worker for offline card viewing

### 7.3 Security
- [ ] Firestore security rules (production-ready, already drafted)
- [ ] Firebase Storage rules (image uploads only, size limit)
- [ ] Rate limiting on AI endpoints
- [ ] Input sanitization on all user content
- [ ] API key rotation plan

### 7.4 Testing
- [ ] Unit tests for spaced repetition algorithm
- [ ] Unit tests for AI service response parsing
- [ ] Integration tests for auth flows
- [ ] Integration tests for deck/card CRUD
- [ ] E2E test for study session flow

### 7.5 Deployment
- [ ] Firebase Hosting deployment (`firebase deploy`)
- [ ] Environment variables for production
- [ ] Custom domain setup
- [ ] CI/CD pipeline (GitHub Actions → Firebase)
- [ ] Monitoring with Firebase Analytics + Performance

### Deliverables
- Polished, accessible, performant application
- Production-ready security rules
- Test coverage on critical paths
- Live deployment on Firebase Hosting

---

## File Structure (Final)

```
firebase/src/
├── App.jsx
├── main.jsx
├── index.css
├── App.css
│
├── config/
│   └── firebase.js
│
├── contexts/
│   └── AuthContext.jsx
│
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── DeckCard.jsx
│   ├── DeckForm.jsx
│   ├── CardPreview.jsx         ← Phase 2
│   ├── CardForm.jsx            ← Phase 2
│   ├── FlashcardFlip.jsx       ← Phase 4
│   ├── AITutorPanel.jsx        ← Phase 4
│   ├── StudySummary.jsx        ← Phase 4
│   ├── StatsCard.jsx           ← Phase 5
│   └── AchievementBadge.jsx    ← Phase 5
│
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── ProfilePage.jsx         (currently in src/)
│   ├── DecksPage.jsx           (currently in src/)
│   ├── CardsPage.jsx           ← Phase 2
│   ├── AIGeneratePage.jsx      ← Phase 3
│   ├── StudyPage.jsx           ← Phase 4
│   ├── DashboardPage.jsx       ← Phase 5
│   └── BrowseDecksPage.jsx     ← Phase 6
│
├── services/
│   ├── deckService.js
│   ├── cardService.js          ← Phase 2
│   ├── aiService.js            ← Phase 3
│   ├── progressService.js      ← Phase 4
│   └── storageService.js       ← Phase 3
│
└── utils/
    ├── spacedRepetition.js     ← Phase 4
    └── formatters.js           ← Phase 5

firebase/functions/               ← NEW (Cloud Functions)
├── index.js
├── ai/
│   ├── generateCards.js        ← Phase 3
│   ├── tutorChat.js            ← Phase 4
│   └── insights.js             ← Phase 5
├── middleware/
│   └── rateLimit.js
└── package.json
```

---

## AI Cost Estimation

Using **GPT-4o-mini** ($0.15 / 1M input tokens, $0.60 / 1M output tokens):

| Action | Avg Tokens | Cost per Call | User Does 10x/day |
|--------|-----------|---------------|-------------------|
| Generate 10 cards from text | ~2,000 in / ~1,500 out | ~$0.0012 | ~$0.012/day |
| AI Explain answer | ~500 in / ~300 out | ~$0.00025 | ~$0.0025/day |
| AI Hint | ~400 in / ~200 out | ~$0.00018 | ~$0.0018/day |
| Weekly study summary | ~1,000 in / ~500 out | ~$0.0005 | ~$0.0005/week |

**Estimated cost per active user: ~$0.50/month**

### Free Tier Strategy
- 20 AI card generations per day (free)
- 30 AI tutor interactions per study session (free)
- Premium: unlimited generations, advanced insights

---

## Implementation Priority & Order

```
Phase 2: Card Management          ███████████░░░░  Core functionality
Phase 3: AI Card Generation       ████████████████  HIGHEST IMPACT
Phase 4: Study Mode + AI Tutor    ████████████████  HIGHEST IMPACT  
Phase 5: Analytics & Dashboard    ██████████░░░░░  High value
Phase 6: Social Features          ████████░░░░░░░  Nice to have
Phase 7: Polish & Deploy          ███████████████░  Required for launch
```

**Phases 3 and 4 are the core differentiators** — AI generation and the AI tutor are what make CardSparks unique compared to Quizlet/Anki.

---

## Environment Variables Needed

```env
# Firebase (already configured)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# OpenAI (Cloud Functions only — NEVER in frontend)
OPENAI_API_KEY=sk-...

# Rate Limiting
AI_DAILY_LIMIT_FREE=20
AI_SESSION_LIMIT=30
```

---

## Getting Started — Next Steps

1. **Now:** Review this plan, decide on AI backend approach (Cloud Functions vs separate API)
2. **Phase 2:** Build card management (CRUD, bulk import, search)
3. **Phase 3:** Set up OpenAI integration, build AI generation page
4. **Phase 4:** Build study mode with AI tutor
5. **Phase 5-7:** Analytics, social features, polish, deploy

---

*Last Updated: March 28, 2026*
