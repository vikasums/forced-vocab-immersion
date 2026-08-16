/**
 * Spaced Repetition (SM-2) & Quiz Engine
 * Manages unique word discovery log, repetition intervals, and interactive quiz generation.
 */

class SpacedRepetitionEngine {
  constructor() {
    this.history = new Map(); // wordId -> { interval, repetitions, easeFactor, nextReviewDate, lastSeenDate }
    this.seenWordIds = new Set();
  }

  /**
   * SuperMemo SM-2 Interval Calculation Algorithm
   * @param {string} wordId 
   * @param {number} quality Grade from 0 to 5 (5 = perfect recall, 3 = pass, 0 = blackout)
   */
  calculateNextReview(wordId, quality = 4) {
    let item = this.history.get(wordId) || {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: Date.now(),
      lastSeenDate: Date.now()
    };

    if (quality >= 3) {
      if (item.repetitions === 0) {
        item.interval = 1; // 1 day
      } else if (item.repetitions === 1) {
        item.interval = 6; // 6 days
      } else {
        item.interval = Math.round(item.interval * item.easeFactor);
      }
      item.repetitions += 1;
    } else {
      item.repetitions = 0;
      item.interval = 1;
    }

    // Update Ease Factor (EF)
    item.easeFactor = item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (item.easeFactor < 1.3) item.easeFactor = 1.3;

    item.lastSeenDate = Date.now();
    item.nextReviewDate = Date.now() + item.interval * 24 * 60 * 60 * 1000;

    this.history.set(wordId, item);
    this.seenWordIds.add(wordId);

    return item;
  }

  /**
   * Mark word as seen for uniqueness tracking
   */
  markSeen(wordId) {
    this.seenWordIds.add(wordId);
    if (!this.history.has(wordId)) {
      this.calculateNextReview(wordId, 4);
    }
  }

  /**
   * Check if a word should be reviewed based on SRS schedule
   */
  isDueForReview(wordId) {
    const item = this.history.get(wordId);
    if (!item) return false;
    return Date.now() >= item.nextReviewDate;
  }

  /**
   * Get list of all seen word IDs to ensure uniqueness
   */
  getSeenWordIds() {
    return Array.from(this.seenWordIds);
  }

  /**
   * Generate 4-option multiple choice quiz for Phase 2 revision
   */
  generateQuiz(currentWord, wordPool = []) {
    const isFrench = currentWord.language === 'fr';
    const correctAnswer = isFrench
      ? `${currentWord.definition_fr} (${currentWord.definition_en})`
      : currentWord.definition_en;

    const distractors = wordPool
      .filter((w) => w.id !== currentWord.id)
      .map((w) => (isFrench ? `${w.definition_fr} (${w.definition_en})` : w.definition_en));

    // Shuffle options
    const options = [correctAnswer, ...distractors.slice(0, 3)];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      word: currentWord.word,
      correctAnswer: correctAnswer,
      options: options
    };
  }
}

module.exports = new SpacedRepetitionEngine();
