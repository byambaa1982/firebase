# Project Status — CardSparks
**AI-Powered Flashcard Study Platform** | React + Vite + Firebase + OpenAI
Last Updated: April 11, 2026

---

## What's Built (Completed)

| Feature | Status |
|---------|--------|
| React + Vite project setup | ✅ Done |
| Firebase project + config | ✅ Done |
| Email/Password + Google OAuth | ✅ Done |
| AuthContext + ProtectedRoute | ✅ Done |
| User profiles in Firestore | ✅ Done |
| Navbar + responsive layout | ✅ Done |
| Deck CRUD (create, edit, delete) | ✅ Done |
| Real-time Firestore deck sync | ✅ Done |
| Deck search + category filtering | ✅ Done |
| DeckCard, DeckForm components | ✅ Done |
| HomePage, LoginPage, ProfilePage | ✅ Done |
| AI flashcard generation (fixed) | ✅ Done |

---

## In Progress

- [ ] Study session UI (FlashcardFlip, spaced repetition logic)
- [ ] Card management (CardsPage, CardForm, CardPreview)
- [ ] Analytics dashboard (study streaks, progress tracking)
- [ ] AI tutor — explain wrong answers, give hints during study

---

## Next Steps

### Phase 1 — Complete Core Study Features
- [ ] Finish `StudyPage.jsx` with flip animations (framer-motion)
- [ ] Wire up `spacedRepetition.js` to Firestore user progress
- [ ] Complete `CardsPage.jsx` and card CRUD operations
- [ ] Add drag-and-drop card reordering (`@dnd-kit/core`)

### Phase 2 — AI Tutor & Enhanced Generation
- [ ] Set up Firebase Cloud Functions (or Railway API) as secure OpenAI proxy
- [ ] AI explains wrong answers during study sessions
- [ ] PDF/document upload → auto-generate flashcards
- [ ] Progressive hints system during study mode

### Phase 3 — Analytics & Gamification
- [ ] Study streak tracking + `StreakDisplay` component
- [ ] Progress charts with recharts
- [ ] Daily study goals and reminders
- [ ] Public deck sharing and discovery

### Phase 4 — Monetization & Launch
- [ ] Implement Stripe subscription billing
- [ ] Gate AI features behind Pro plan
- [ ] Add usage limits for free tier (e.g., AI generation quota)
- [ ] SEO optimization and landing page polish
- [ ] Launch on Product Hunt / Reddit study communities

---

## Monetization Strategy

### Free Tier
- Up to 5 decks, 50 cards total
- Manual card creation only
- Basic study mode

### Pro Plan (~$8/month)
- Unlimited decks and cards
- AI flashcard generation from text, topics, PDFs
- AI tutor during study sessions (hints + explanations)
- Advanced analytics and progress tracking
- Priority support

### Future Revenue Streams
- **Team/Classroom Plan**: Teachers manage multiple students, share decks
- **Marketplace**: Buy/sell premium pre-made deck packs
- **API Access**: Let third-party apps generate cards via the AI backend

---

## End Goal

Build **CardSparks** into a profitable SaaS product that helps students study smarter using AI.

- **Revenue Target**: $5,000 MRR within 12 months of public launch
- **User Growth**: 10,000 active users in year one
- **Profitability**: Cover infrastructure costs within 3 months, reach profit by month 6
- **Long-Term**: Become a go-to AI study tool, attracting acquisition interest or Series A investment