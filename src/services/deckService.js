import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Deck Service - Handles all Firestore operations for flashcard decks
 */

// Create a new deck
export const createDeck = async (userId, deckData) => {
  try {
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
    
    // Update user stats
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.totalDecks': increment(1)
    });

    return { id: docRef.id, ...newDeck };
  } catch (error) {
    console.error('Error creating deck:', error);
    throw error;
  }
};

// Get all decks for a user
export const getUserDecks = async (userId) => {
  try {
    const decksRef = collection(db, 'decks');
    const q = query(
      decksRef,
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const decks = [];
    querySnapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
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

// Delete a deck
export const deleteDeck = async (deckId, userId) => {
  try {
    const deckRef = doc(db, 'decks', deckId);
    await deleteDoc(deckRef);

    // Update user stats
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.totalDecks': increment(-1)
    });

    // TODO: Also delete all cards in this deck (Phase 3)
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
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const decks = [];
      querySnapshot.forEach((doc) => {
        decks.push({ id: doc.id, ...doc.data() });
      });
      callback(decks);
    }, (error) => {
      console.error('Error in deck subscription:', error);
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
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const decks = [];
    querySnapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
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
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    if (category && category !== 'All') {
      q = query(
        decksRef,
        where('createdBy', '==', userId),
        where('category', '==', category),
        orderBy('updatedAt', 'desc')
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
