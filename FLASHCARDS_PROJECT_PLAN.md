# Flashcards App - Project Plan
**Google Firebase React Application**

---

## Project Overview

Build a full-featured flashcards learning application using React + Vite frontend with Firebase backend (Authentication, Firestore Database, and Storage). The app will allow users to create, organize, study, and track their learning progress with interactive flashcard decks.

**Current State:**
- ✅ React + Vite setup (firebase folder)
- ✅ Basic routing (HomePage, LoginPage)
- ✅ UI foundation with Tailwind-style components
- ❌ Firebase SDK not integrated
- ❌ No authentication implementation
- ❌ No database structure

---

## Phase 1: Firebase Setup & Authentication (Week 1)

### Goals
Integrate Firebase services and implement user authentication system.

### Tasks

#### 1.1 Firebase Project Configuration
- [ ] Create Firebase project in Google Cloud Console
- [ ] Enable Authentication, Firestore Database, and Storage services
- [ ] Generate Firebase config credentials
- [ ] Install Firebase SDK: `npm install firebase`
- [ ] Create `firebase/src/config/firebase.js` with initialization

#### 1.2 Authentication Implementation
- [ ] Set up Firebase Authentication with Email/Password provider
- [ ] Add Google OAuth provider (optional)
- [ ] Create `AuthContext.jsx` for global auth state management
- [ ] Update `LoginPage.jsx` with real Firebase auth methods
  - Sign Up functionality
  - Sign In functionality
  - Password reset flow
  - Error handling and validation

#### 1.3 Protected Routes
- [ ] Install React Router: `npm install react-router-dom`
- [ ] Replace manual routing with React Router
- [ ] Create `ProtectedRoute` component
- [ ] Implement auth state persistence
- [ ] Add logout functionality

#### 1.4 User Profile
- [ ] Create user profile in Firestore on signup
- [ ] Store user metadata (name, email, created date)
- [ ] Create basic profile page component

### Deliverables
- Working authentication system
- User can sign up, sign in, and sign out
- Protected routes require authentication
- User profiles stored in Firestore

---

## Phase 2: Database Schema & Deck Management (Week 2)

### Goals
Design Firestore database structure and implement flashcard deck CRUD operations.

### Tasks

#### 2.1 Firestore Database Schema
```
users/
  {userId}/
    - email, displayName, createdAt, stats
    
decks/
  {deckId}/
    - name, description, createdBy, createdAt, updatedAt
    - category, isPublic, cardCount
    
cards/
  {cardId}/
    - deckId, front, back, imageUrl
    - createdAt, difficulty
    
userProgress/
  {userId}/
    decks/
      {deckId}/
        - lastStudied, correctCount, incorrectCount
        - masteryLevel, cards/{cardId}: {correct, incorrect, lastReviewed}
```

#### 2.2 Deck Management Components
- [ ] Create `DecksPage.jsx` - display all user decks
- [ ] Create `DeckForm.jsx` - create/edit deck modal
- [ ] Create `DeckCard.jsx` - deck preview component
- [ ] Implement deck CRUD operations:
  - Create new deck
  - Edit deck details
  - Delete deck (with confirmation)
  - View deck list with filtering/search

#### 2.3 Firestore Integration
- [ ] Create `services/deckService.js` with Firestore methods
- [ ] Implement real-time listeners for deck updates
- [ ] Add loading states and error handling
- [ ] Implement pagination for large deck lists

#### 2.4 Navigation Update
- [ ] Add navigation menu with:
  - My Decks
  - Browse Public Decks
  - Profile
  - Logout
- [ ] Create responsive sidebar/navbar component

### Deliverables
- Complete database schema implemented
- Users can create, read, update, delete decks
- Real-time deck synchronization
- Intuitive navigation system

---

## Phase 3: Flashcard Management & Media Upload (Week 3)

### Goals
Implement flashcard creation/editing and integrate Firebase Storage for images.

### Tasks

#### 3.1 Card Management UI
- [ ] Create `CardsPage.jsx` - view all cards in a deck
- [ ] Create `CardForm.jsx` - create/edit individual cards
- [ ] Create `CardPreview.jsx` - display card front/back
- [ ] Implement card reordering (drag-and-drop)
- [ ] Install DnD library: `npm install @dnd-kit/core @dnd-kit/sortable`

#### 3.2 Card CRUD Operations
- [ ] Create `services/cardService.js`
- [ ] Implement card operations:
  - Add card to deck
  - Edit card content
  - Delete card
  - Bulk import cards (CSV/JSON)
  - Duplicate card

#### 3.3 Firebase Storage Integration
- [ ] Set up Firebase Storage rules
- [ ] Create `services/storageService.js`
- [ ] Implement image upload functionality:
  - File selection and preview
  - Upload to Firebase Storage
  - Progress indicator
  - Image URL retrieval and storage in Firestore
  - Image compression before upload

#### 3.4 Rich Text Support
- [ ] Add markdown support for card content (optional)
- [ ] Install: `npm install react-markdown`
- [ ] Support formatting: bold, italic, lists, code blocks
- [ ] Image embedding in cards

#### 3.5 Card Categories & Tags
- [ ] Add tagging system for cards
- [ ] Implement difficulty levels (Easy/Medium/Hard)
- [ ] Add color coding for visual organization

### Deliverables
- Full card management system
- Image upload and display functionality
- Bulk card import capability
- Rich formatting support

---

## Phase 4: Study Mode & Spaced Repetition (Week 4)

### Goals
Build interactive study interface with spaced repetition algorithm.

### Tasks

#### 4.1 Study Mode Interface
- [ ] Create `StudyPage.jsx` - main study interface
- [ ] Create `Flashcard.jsx` - animated flip card component
- [ ] Install animation library: `npm install framer-motion`
- [ ] Implement card flip animation
- [ ] Add keyboard shortcuts (Space to flip, Arrow keys to navigate)
- [ ] Show progress bar (X/Y cards completed)

#### 4.2 Study Controls
- [ ] "Know It" / "Still Learning" buttons
- [ ] Skip card option
- [ ] Shuffle deck option
- [ ] Study session timer
- [ ] Pause/Resume functionality
- [ ] Exit with progress save

#### 4.3 Spaced Repetition Algorithm
- [ ] Implement simplified SM-2 algorithm
- [ ] Create `utils/spacedRepetition.js`
- [ ] Calculate next review date based on performance
- [ ] Track individual card statistics:
  - Times reviewed
  - Times correct/incorrect
  - Current interval
  - Ease factor

#### 4.4 Study Progress Tracking
- [ ] Create `services/progressService.js`
- [ ] Update user progress in real-time during study
- [ ] Save study session results to Firestore
- [ ] Calculate deck mastery percentage
- [ ] Implement streak tracking

#### 4.5 Study Modes
- [ ] Classic mode (sequential)
- [ ] Random mode (shuffled)
- [ ] Review mode (only cards due for review)
- [ ] Test mode (no flipping, answer input)

### Deliverables
- Interactive study interface with animations
- Spaced repetition algorithm implementation
- Progress tracking and statistics
- Multiple study mode options

---

## Phase 5: Analytics, Polish & Deployment (Week 5)

### Goals
Add analytics dashboard, polish UI/UX, optimize performance, and deploy.

### Tasks

#### 5.1 Analytics Dashboard
- [ ] Create `DashboardPage.jsx`
- [ ] Install chart library: `npm install recharts`
- [ ] Implement statistics:
  - Total cards studied
  - Study streak
  - Accuracy rate
  - Study time per day/week
  - Mastery level by deck
  - Cards due for review
- [ ] Create visual charts:
  - Study activity heatmap
  - Performance over time line chart
  - Deck progress pie chart

#### 5.2 Public Deck Browsing
- [ ] Create `BrowseDecksPage.jsx`
- [ ] Implement deck sharing functionality
- [ ] Add deck search and filtering:
  - By category
  - By popularity
  - By rating
- [ ] Clone public deck to user library
- [ ] Add rating/review system (optional)

#### 5.3 UI/UX Polish
- [ ] Implement consistent color scheme
- [ ] Add loading skeletons
- [ ] Improve error messages
- [ ] Add toast notifications: `npm install react-hot-toast`
- [ ] Ensure mobile responsiveness
- [ ] Add dark mode toggle (optional)
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

#### 5.4 Performance Optimization
- [ ] Implement code splitting with React.lazy()
- [ ] Optimize images (WebP format, lazy loading)
- [ ] Add service worker for offline capability
- [ ] Implement Firestore query optimization:
  - Use indexes
  - Limit query results
  - Cache frequently accessed data
- [ ] Reduce bundle size

#### 5.5 Testing & Quality Assurance
- [ ] Set up Vitest: `npm install -D vitest @testing-library/react`
- [ ] Write unit tests for utilities
- [ ] Write integration tests for key flows
- [ ] Test authentication edge cases
- [ ] Cross-browser testing
- [ ] Mobile device testing

#### 5.6 Deployment
- [ ] Configure Firebase Hosting
- [ ] Set up environment variables
- [ ] Create production Firebase project
- [ ] Configure Firestore security rules:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /decks/{deckId} {
        allow read: if resource.data.isPublic == true || 
                       (request.auth != null && request.auth.uid == resource.data.createdBy);
        allow write: if request.auth != null && request.auth.uid == resource.data.createdBy;
      }
      match /cards/{cardId} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```
- [ ] Configure Storage security rules
- [ ] Run production build: `npm run build`
- [ ] Deploy to Firebase: `firebase deploy`
- [ ] Set up custom domain (optional)
- [ ] Configure Analytics in Firebase Console

#### 5.7 Documentation
- [ ] Update README.md with:
  - Project description
  - Features list
  - Installation instructions
  - Environment setup
  - Deployment guide
- [ ] Create user guide
- [ ] Document API/service methods
- [ ] Add inline code comments

### Deliverables
- Analytics dashboard with visualizations
- Public deck browsing and sharing
- Polished, responsive UI
- Production deployment on Firebase Hosting
- Comprehensive documentation

---

## Technical Stack Summary

### Frontend
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Routing:** React Router DOM
- **Styling:** CSS (Tailwind-style utility classes)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **State Management:** React Context API
- **Drag & Drop:** @dnd-kit

### Backend (Firebase)
- **Authentication:** Firebase Auth (Email/Password, Google OAuth)
- **Database:** Cloud Firestore (NoSQL)
- **Storage:** Firebase Storage (images)
- **Hosting:** Firebase Hosting
- **Analytics:** Firebase Analytics

### Development Tools
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint
- **Package Manager:** npm

---

## Success Metrics

- [ ] Users can create accounts and authenticate securely
- [ ] Users can create unlimited decks and cards
- [ ] Images upload and display correctly
- [ ] Study mode works smoothly with animations
- [ ] Spaced repetition algorithm improves retention
- [ ] App is responsive on mobile and desktop
- [ ] Page load time < 3 seconds
- [ ] App works offline (basic functionality)
- [ ] No critical security vulnerabilities
- [ ] Successfully deployed to production

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Firebase quota limits | High | Implement pagination, caching, optimize queries |
| Large image uploads | Medium | Implement compression, size limits (2MB max) |
| Complex state management | Medium | Use Context API effectively, consider Zustand if needed |
| Authentication edge cases | High | Comprehensive error handling, session management |
| Firestore costs | Medium | Monitor usage, implement read/write optimizations |
| Browser compatibility | Low | Test on major browsers, use polyfills |

---

## Timeline Overview

- **Week 1:** Firebase setup & authentication
- **Week 2:** Database schema & deck management
- **Week 3:** Flashcard management & media upload
- **Week 4:** Study mode & spaced repetition
- **Week 5:** Analytics, polish & deployment

**Total Duration:** 5 weeks

---

## Next Steps

1. Review and approve this project plan
2. Create Firebase project in Google Cloud Console
3. Begin Phase 1: Install Firebase SDK and implement authentication
4. Set up version control (Git) and create feature branches for each phase
5. Schedule weekly progress reviews

---

*Last Updated: February 7, 2026*
