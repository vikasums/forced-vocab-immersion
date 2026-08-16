const srs = require('../../src/engine/srs');

describe('SpacedRepetitionEngine SM-2 Unit Tests', () => {
  test('calculateNextReview updates intervals correctly', () => {
    const wordId = 'test_word_1';
    
    // First review with high grade
    const result1 = srs.calculateNextReview(wordId, 5);
    expect(result1.repetitions).toBe(1);
    expect(result1.interval).toBe(1);

    // Second review
    const result2 = srs.calculateNextReview(wordId, 5);
    expect(result2.repetitions).toBe(2);
    expect(result2.interval).toBe(6);
  });

  test('markSeen adds word to seen set for uniqueness', () => {
    srs.markSeen('fr_ephemere');
    const seen = srs.getSeenWordIds();
    expect(seen).toContain('fr_ephemere');
  });

  test('generateQuiz creates 4 options with exact correct answer', () => {
    const currentWord = {
      id: 'fr_test',
      word: 'TestWord',
      language: 'fr',
      definition_fr: 'Définition de test',
      definition_en: 'Test definition'
    };

    const wordPool = [
      currentWord,
      { id: '1', definition_fr: 'D1', definition_en: 'E1' },
      { id: '2', definition_fr: 'D2', definition_en: 'E2' },
      { id: '3', definition_fr: 'D3', definition_en: 'E3' }
    ];

    const quiz = srs.generateQuiz(currentWord, wordPool);
    expect(quiz.word).toBe('TestWord');
    expect(quiz.options.length).toBe(4);
    expect(quiz.options).toContain('Définition de test (Test definition)');
  });
});
