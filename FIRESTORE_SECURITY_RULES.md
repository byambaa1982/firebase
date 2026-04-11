# Firestore Security Rules for Flashcards App

## Important: Apply these rules in your Firebase Console

Go to Firebase Console → Firestore Database → Rules and paste the following rules.

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read and write their own profile
      allow read, write: if isOwner(userId);
    }
    
    // Decks collection
    match /decks/{deckId} {
      // Anyone can read public decks
      // Owner can read their own decks (public or private)
      allow read: if resource.data.isPublic == true 
                     || (isAuthenticated() && request.auth.uid == resource.data.createdBy);
      
      // Only deck owner can update or delete
      allow update, delete: if isAuthenticated() && request.auth.uid == resource.data.createdBy;
      
      // Authenticated users can create decks
      // Ensure createdBy is set to the current user
      allow create: if isAuthenticated() 
                       && request.resource.data.createdBy == request.auth.uid;
    }
    
    // Cards collection (Phase 3)
    match /cards/{cardId} {
      // Authenticated users can read cards
      allow read: if isAuthenticated();
      
      // Users can create, update, delete their own cards
      // This will be refined in Phase 3 to check deck ownership
      allow create, update, delete: if isAuthenticated();
    }
    
    // User Progress collection (Phase 4)
    match /userProgress/{userId} {
      // Users can only access their own progress
      allow read, write: if isOwner(userId);
      
      match /decks/{deckId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

## How to Apply Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy and paste the rules above
5. Click **Publish**

## Rules Explanation

### Users Collection
- Users can only read and modify their own profile data
- Prevents unauthorized access to other users' information

### Decks Collection
- **Read**: Public decks can be read by anyone; private decks only by the owner
- **Create**: Any authenticated user can create a deck (owner must match auth.uid)
- **Update/Delete**: Only the deck owner can modify or delete their decks

### Cards Collection (Phase 3)
- Basic authentication required for all operations
- Will be enhanced in Phase 3 to ensure users can only modify cards in their own decks

### User Progress Collection (Phase 4)
- Users can only read/write their own study progress
- Prevents cheating and unauthorized access to statistics

## Testing Rules

After publishing, test your rules:

1. Sign in with a user account
2. Try creating a deck (should succeed)
3. Try accessing another user's private deck (should fail)
4. Try accessing a public deck (should succeed)
5. Try deleting another user's deck (should fail)

## Security Best Practices

✅ **DO:**
- Always validate `createdBy` matches `request.auth.uid` for creates
- Use helper functions for cleaner, reusable logic
- Test rules thoroughly before deploying to production
- Keep rules restrictive by default

❌ **DON'T:**
- Never use `allow read, write: if true;` in production
- Don't trust client-side data validation alone
- Don't expose sensitive user data in public documents

## Next Steps (Phase 3)

When implementing cards management, update card rules to:
- Verify the user owns the deck before allowing card modifications
- Implement cascade delete for cards when a deck is deleted

## Monitoring

Monitor rule denials in Firebase Console:
- Firestore → Usage tab
- Check for unauthorized access attempts
- Review denied operations regularly
