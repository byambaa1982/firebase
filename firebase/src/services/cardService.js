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
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Create a new card in a deck
export const createCard = async (deckId, cardData) => {
  try {
    const cardsRef = collection(db, 'cards');
    const newCard = {
      deckId,
      front: cardData.front,
      back: cardData.back,
      hints: cardData.hints || [],
      difficulty: cardData.difficulty || 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(cardsRef, newCard);

    // Update deck card count
    const deckRef = doc(db, 'decks', deckId);
    await updateDoc(deckRef, {
      cardCount: increment(1),
      updatedAt: serverTimestamp()
    });

    return { id: docRef.id, ...newCard };
  } catch (error) {
    console.error('Error creating card:', error);
    throw error;
  }
};

// Get all cards for a deck
export const getDeckCards = async (deckId) => {
  try {
    const cardsRef = collection(db, 'cards');
    const q = query(
      cardsRef,
      where('deckId', '==', deckId)
    );

    const querySnapshot = await getDocs(q);
    const cards = [];
    querySnapshot.forEach((doc) => {
      cards.push({ id: doc.id, ...doc.data() });
    });

    // Sort client-side: oldest first
    cards.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return aTime - bTime;
    });

    return cards;
  } catch (error) {
    console.error('Error getting deck cards:', error);
    throw error;
  }
};

// Subscribe to real-time card updates for a deck
export const subscribeToDeckCards = (deckId, callback) => {
  try {
    const cardsRef = collection(db, 'cards');
    const q = query(
      cardsRef,
      where('deckId', '==', deckId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cards = [];
      querySnapshot.forEach((doc) => {
        cards.push({ id: doc.id, ...doc.data() });
      });
      // Sort client-side: oldest first
      cards.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return aTime - bTime;
      });
      callback(cards);
    }, (error) => {
      console.error('Error in card subscription:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to cards:', error);
    throw error;
  }
};

// Update a card
export const updateCard = async (cardId, cardData) => {
  try {
    const cardRef = doc(db, 'cards', cardId);
    const updateData = {
      front: cardData.front,
      back: cardData.back,
      hints: cardData.hints || [],
      difficulty: cardData.difficulty || 'medium',
      updatedAt: serverTimestamp()
    };

    await updateDoc(cardRef, updateData);
    return { id: cardId, ...updateData };
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

// Delete a card
export const deleteCard = async (cardId, deckId) => {
  try {
    const cardRef = doc(db, 'cards', cardId);
    await deleteDoc(cardRef);

    // Update deck card count
    const deckRef = doc(db, 'decks', deckId);
    await updateDoc(deckRef, {
      cardCount: increment(-1),
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};

// Bulk delete cards
export const bulkDeleteCards = async (cardIds, deckId) => {
  try {
    const batch = writeBatch(db);

    cardIds.forEach((cardId) => {
      const cardRef = doc(db, 'cards', cardId);
      batch.delete(cardRef);
    });

    // Update deck card count
    const deckRef = doc(db, 'decks', deckId);
    batch.update(deckRef, {
      cardCount: increment(-cardIds.length),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error bulk deleting cards:', error);
    throw error;
  }
};

// Duplicate a card
export const duplicateCard = async (cardId, deckId) => {
  try {
    const cardRef = doc(db, 'cards', cardId);
    const cardSnap = await getDoc(cardRef);

    if (!cardSnap.exists()) {
      throw new Error('Card not found');
    }

    const cardData = cardSnap.data();
    return await createCard(deckId, {
      front: cardData.front,
      back: cardData.back,
      hints: cardData.hints || [],
      difficulty: cardData.difficulty || 'medium'
    });
  } catch (error) {
    console.error('Error duplicating card:', error);
    throw error;
  }
};

// Bulk import cards from an array of {front, back} objects
export const bulkImportCards = async (deckId, cardsArray) => {
  try {
    const batch = writeBatch(db);
    const cardsRef = collection(db, 'cards');

    cardsArray.forEach((card) => {
      const newDocRef = doc(cardsRef);
      batch.set(newDocRef, {
        deckId,
        front: card.front,
        back: card.back,
        hints: card.hints || [],
        difficulty: card.difficulty || 'medium',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    // Update deck card count
    const deckRef = doc(db, 'decks', deckId);
    batch.update(deckRef, {
      cardCount: increment(cardsArray.length),
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error bulk importing cards:', error);
    throw error;
  }
};

// Delete all cards in a deck (for deck deletion cascade)
export const deleteAllDeckCards = async (deckId) => {
  try {
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, where('deckId', '==', deckId));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return querySnapshot.size;
  } catch (error) {
    console.error('Error deleting all deck cards:', error);
    throw error;
  }
};
