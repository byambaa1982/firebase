import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Create a new study session
export const createStudySession = async (userId, deckId, totalCards) => {
  try {
    const sessionsRef = collection(db, 'studySessions');
    const session = {
      userId,
      deckId,
      startedAt: serverTimestamp(),
      endedAt: null,
      totalCards,
      cardsStudied: 0,
      correctCount: 0,
      incorrectCount: 0,
      partialCount: 0
    };
    const docRef = await addDoc(sessionsRef, session);
    return { id: docRef.id, ...session };
  } catch (error) {
    console.error('Error creating study session:', error);
    return null;
  }
};

// End a study session
export const endStudySession = async (sessionId, results) => {
  try {
    const sessionRef = doc(db, 'studySessions', sessionId);
    await updateDoc(sessionRef, {
      endedAt: serverTimestamp(),
      cardsStudied: results.cardsStudied,
      correctCount: results.correctCount,
      incorrectCount: results.incorrectCount,
      partialCount: results.partialCount
    });
  } catch (error) {
    console.error('Error ending study session:', error);
  }
};

// Update card's spaced repetition data
export const updateCardProgress = async (cardId, spacedRepetition) => {
  try {
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, { spacedRepetition });
  } catch (error) {
    console.error('Error updating card progress:', error);
  }
};
