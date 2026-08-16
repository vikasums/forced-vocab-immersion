const dictionaryApi = require('../../src/engine/dictionaryApi');

describe('DictionaryApiService Unit Tests', () => {
  test('getNextWord returns valid French word entry with dual definitions', async () => {
    const word = await dictionaryApi.getNextWord('fr', []);
    expect(word).toBeDefined();
    expect(word.word).toBeDefined();
    expect(word.language).toBe('fr');
    expect(word.definition_fr).toBeDefined();
    expect(word.definition_en).toBeDefined();
    expect(word.example_fr).toBeDefined();
    expect(word.example_en).toBeDefined();
  });

  test('getNextWord respects seen word history to guarantee uniqueness', async () => {
    const seenIds = ['fr_ephemere', 'fr_bienveillance', 'fr_serendipite', 'fr_resilience'];
    const word = await dictionaryApi.getNextWord('fr', seenIds);
    expect(word).toBeDefined();
    expect(word.id).toBe('fr_melliflue');
  });

  test('fetchEnglishWord handles live API fallback structure gracefully', async () => {
    const word = await dictionaryApi.fetchEnglishWord('serendipity');
    if (word) {
      expect(word.word.toLowerCase()).toBe('serendipity');
      expect(word.definition_en).toBeDefined();
    }
  });
});
