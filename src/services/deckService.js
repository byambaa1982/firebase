import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Helper: safely update user stats (creates profile if missing)
const safeUpdateUserStats = async (userId, statsUpdate) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, statsUpdate);
  } catch (error) {
    // If user doc doesn't exist, create it with defaults
    if (error.code === 'not-found' || error.message?.includes('No document to update')) {
      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          createdAt: new Date().toISOString(),
          stats: { totalDecks: 0, totalCards: 0, totalStudySessions: 0, currentStreak: 0 }
        }, { merge: true });
        await updateDoc(userRef, statsUpdate);
      } catch (retryError) {
        console.error('Error updating user stats:', retryError);
      }
    } else {
      console.error('Error updating user stats:', error);
    }
  }
};

/**
 * Deck Service - Handles all Firestore operations for flashcard decks
 */

// Create a new deck
export const createDeck = async (userId, deckData) => {
  try {
    console.log('Creating deck for user:', userId, 'data:', deckData);
    const decksRef = collection(db, 'decks');
    const newDeck = {
      name: deckData.name,
      description: deckData.description || '',
      category: deckData.category || 'General',
      isPublic: deckData.isPublic || false,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      cardCount: 0
    };

    const docRef = await addDoc(decksRef, newDeck);
    console.log('Deck created with ID:', docRef.id);
    
    // Update user stats (non-blocking)
    safeUpdateUserStats(userId, { 'stats.totalDecks': increment(1) });

    return { id: docRef.id, ...newDeck };
  } catch (error) {
    console.error('Error creating deck:', error);
    console.error('Error code:', error.code, 'Message:', error.message);
    throw error;
  }
};

// Get all decks for a user
export const getUserDecks = async (userId) => {
  try {
    const decksRef = collection(db, 'decks');
    const q = query(
      decksRef,
      where('createdBy', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const decks = [];
    querySnapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
    });

    // Sort client-side: newest first
    decks.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return decks;
  } catch (error) {
    console.error('Error getting user decks:', error);
    throw error;
  }
};

// Get a single deck by ID
export const getDeck = async (deckId) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    const deckSnap = await getDoc(deckRef);

    if (deckSnap.exists()) {
      return { id: deckSnap.id, ...deckSnap.data() };
    } else {
      throw new Error('Deck not found');
    }
  } catch (error) {
    console.error('Error getting deck:', error);
    throw error;
  }
};

// Update a deck
export const updateDeck = async (deckId, deckData) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    const updateData = {
      ...deckData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(deckRef, updateData);
    return { id: deckId, ...updateData };
  } catch (error) {
    console.error('Error updating deck:', error);
    throw error;
  }
};

// Delete a deck and all its cards
export const deleteDeck = async (deckId, userId) => {
  try {
    // Delete all cards in this deck first
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, where('deckId', '==', deckId));
    const cardSnap = await getDocs(q);
    const batch = (await import('firebase/firestore')).writeBatch(db);
    cardSnap.forEach((cardDoc) => {
      batch.delete(cardDoc.ref);
    });
    await batch.commit();

    // Delete the deck itself
    const deckRef = doc(db, 'decks', deckId);
    await deleteDoc(deckRef);

    // Update user stats
    safeUpdateUserStats(userId, {
      'stats.totalDecks': increment(-1),
      'stats.totalCards': increment(-(cardSnap.size))
    });

    return true;
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw error;
  }
};

// Subscribe to real-time updates for user decks
export const subscribeToUserDecks = (userId, callback) => {
  try {
    const decksRef = collection(db, 'decks');
    const q = query(
      decksRef,
      where('createdBy', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const decks = [];
      querySnapshot.forEach((doc) => {
        decks.push({ id: doc.id, ...doc.data() });
      });
      // Sort client-side: newest first
      decks.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis?.() || 0;
        const bTime = b.updatedAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      callback(decks);
    }, (error) => {
      console.error('Error in deck subscription:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to decks:', error);
    throw error;
  }
};

// Get public decks (for browsing)
export const getPublicDecks = async (limit = 20) => {
  try {
    const decksRef = collection(db, 'decks');
    const q = query(
      decksRef,
      where('isPublic', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const decks = [];
    querySnapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
    });

    // Sort client-side: newest first
    decks.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return decks.slice(0, limit);
  } catch (error) {
    console.error('Error getting public decks:', error);
    throw error;
  }
};

// Search decks by name or category
export const searchDecks = async (userId, searchTerm, category = null) => {
  try {
    const decksRef = collection(db, 'decks');
    let q = query(
      decksRef,
      where('createdBy', '==', userId)
    );

    if (category && category !== 'All') {
      q = query(
        decksRef,
        where('createdBy', '==', userId),
        where('category', '==', category)
      );
    }

    const querySnapshot = await getDocs(q);
    const decks = [];
    querySnapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
    });

    // Filter by search term (client-side)
    if (searchTerm) {
      return decks.filter(deck => 
        deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deck.description && deck.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return decks;
  } catch (error) {
    console.error('Error searching decks:', error);
    throw error;
  }
};

// Update deck card count
export const updateDeckCardCount = async (deckId, change) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    await updateDoc(deckRef, {
      cardCount: increment(change),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating deck card count:', error);
    throw error;
  }
};
