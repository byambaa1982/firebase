/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm by Piotr Wozniak
 *
 * Quality ratings:
 *   0 - Complete blackout (didn't know)
 *   3 - Partially knew
 *   5 - Perfect response (knew it)
 */

const MIN_EASE_FACTOR = 1.3;

export function calculateNextReview(card, quality) {
  // Map simple ratings to SM-2 scale: 0 = didn't know, 3 = partial, 5 = knew it
  const prevInterval = card.spacedRepetition?.interval || 0;
  const prevEase = card.spacedRepetition?.easeFactor || 2.5;
  const timesReviewed = (card.spacedRepetition?.timesReviewed || 0) + 1;
  const timesCorrect = (card.spacedRepetition?.timesCorrect || 0) + (quality >= 3 ? 1 : 0);

  let newInterval;
  let newEase = prevEase;

  if (quality < 3) {
    // Failed — reset interval
    newInterval = 1;
  } else {
    // Passed — calculate new ease factor
    newEase = prevEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEase < MIN_EASE_FACTOR) newEase = MIN_EASE_FACTOR;

    if (prevInterval === 0) {
      newInterval = 1;
    } else if (prevInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(prevInterval * newEase);
    }
  }

  const now = new Date();
  const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    interval: newInterval,
    easeFactor: Math.round(newEase * 100) / 100,
    nextReviewDate: nextReviewDate.toISOString(),
    timesReviewed,
    timesCorrect,
    lastReviewed: now.toISOString()
  };
}

export function getDueCards(cards) {
  const now = new Date();
  return cards.filter(card => {
    if (!card.spacedRepetition?.nextReviewDate) return true; // Never reviewed
    return new Date(card.spacedRepetition.nextReviewDate) <= now;
  });
}

export function getMasteryPercent(card) {
  const sr = card.spacedRepetition;
  if (!sr || !sr.timesReviewed) return 0;
  return Math.round((sr.timesCorrect / sr.timesReviewed) * 100);
}
