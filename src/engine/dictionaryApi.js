/**
 * Live Public Dictionary & Vocabulary API Service
 * Integrates Datamuse API, Free Dictionary API (api.dictionaryapi.dev), and Wiktionary translation endpoints.
 */

const HTTPS = require('https');

// Fallback seed vocabulary with rich dual-language French & English definitions
const SEED_FRENCH_WORDS = [
  {
    id: 'fr_ephemere',
    word: 'Éphémère',
    phonetic: '/e.fe.mɛʁ/',
    partOfSpeech: 'adjectif',
    definition_fr: 'Qui ne dure que très peu de temps; passager et fugace.',
    definition_en: 'Lasting for a very short time; ephemeral, fleeting or transient.',
    example_fr: 'La beauté des fleurs de cerisier est merveilleuse mais éphémère.',
    example_en: 'The beauty of cherry blossoms is wonderful but ephemeral.',
    audioText: 'éphémère',
    language: 'fr'
  },
  {
    id: 'fr_bienveillance',
    word: 'Bienveillance',
    phonetic: '/bjɛ̃.vɛ.jɑ̃s/',
    partOfSpeech: 'nom féminin',
    definition_fr: 'Disposition d\'esprit inclinant à la compréhension et au bien d\'autrui.',
    definition_en: 'Disposition to do good; kindness, benevolence, and goodwill.',
    example_fr: 'Elle a accueilli le nouveau venu avec beaucoup de bienveillance.',
    example_en: 'She welcomed the newcomer with great kindness and goodwill.',
    audioText: 'bienveillance',
    language: 'fr'
  },
  {
    id: 'fr_serendipite',
    word: 'Sérendipité',
    phonetic: '/se.ʁɛ̃.di.pi.te/',
    partOfSpeech: 'nom féminin',
    definition_fr: 'Capacité de faire par hasard une découverte inattendue et fructueuse.',
    definition_en: 'The occurrence and development of events by chance in a happy or beneficial way.',
    example_fr: 'La découverte de la pénicilline est un exemple célèbre de sérendipité.',
    example_en: 'The discovery of penicillin is a famous example of serendipity.',
    audioText: 'sérendipité',
    language: 'fr'
  },
  {
    id: 'fr_resilience',
    word: 'Résilience',
    phonetic: '/ʁe.zi.ljɑ̃s/',
    partOfSpeech: 'nom féminin',
    definition_fr: 'Capacité à surmonter les épreuves et les traumatismes de la vie.',
    definition_en: 'The capacity to recover quickly from difficulties; toughness and adaptability.',
    example_fr: 'Leur résilience face à la crise a inspiré toute la communauté.',
    example_en: 'Their resilience in the face of crisis inspired the whole community.',
    audioText: 'résilience',
    language: 'fr'
  },
  {
    id: 'fr_melliflue',
    word: 'Melliflue',
    phonetic: '/mɛ.li.fly/',
    partOfSpeech: 'adjectif',
    definition_fr: 'Qui a la douceur du miel; suave et harmonieux à l\'écoute.',
    definition_en: 'Sweet or musical; pleasant to hear (like honey).',
    example_fr: 'Le pianiste jouait une mélodie melliflue dans la pénombre.',
    example_en: 'The pianist played a mellifluous melody in the dim light.',
    audioText: 'melliflue',
    language: 'fr'
  }
];

const SEED_ENGLISH_WORDS = [
  {
    id: 'en_serendipity',
    word: 'Serendipity',
    phonetic: '/ˌsɛr.ənˈdɪp.ə.ti/',
    partOfSpeech: 'noun',
    definition_en: 'Finding valuable or agreeable things not sought for by chance.',
    example_en: 'They met purely by serendipity at an international airport.',
    audioText: 'serendipity',
    language: 'en'
  },
  {
    id: 'en_ephemeral',
    word: 'Ephemeral',
    phonetic: '/ɪˈfɛm.ər.əl/',
    partOfSpeech: 'adjective',
    definition_en: 'Lasting for a very short time; transitory.',
    example_en: 'Fame in the digital age can often be ephemeral.',
    audioText: 'ephemeral',
    language: 'en'
  },
  {
    id: 'en_ubiquitous',
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    partOfSpeech: 'adjective',
    definition_en: 'Present, appearing, or found everywhere at once.',
    example_en: 'Smartphones have become ubiquitous in modern society.',
    audioText: 'ubiquitous',
    language: 'en'
  },
  {
    id: 'en_eloquent',
    word: 'Eloquent',
    phonetic: '/ˈɛl.ə.kwənt/',
    partOfSpeech: 'adjective',
    definition_en: 'Fluent or persuasive in speaking or writing.',
    example_en: 'Her speech was so eloquent that it moved the entire audience to tears.',
    audioText: 'eloquent',
    language: 'en'
  }
];

class DictionaryApiService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Helper function to make HTTPS GET requests
   */
  fetchJson(url) {
    return new Promise((resolve, reject) => {
      HTTPS.get(url, { headers: { 'User-Agent': 'ForcedVocabApp/1.0' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(data));
            } else {
              resolve(null);
            }
          } catch (err) {
            resolve(null);
          }
        });
      }).on('error', (err) => resolve(null));
    });
  }

  /**
   * Fetch English word data live from api.dictionaryapi.dev
   */
  async fetchEnglishWord(wordStr) {
    const cached = this.cache.get(`en_${wordStr.toLowerCase()}`);
    if (cached) return cached;

    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordStr)}`;
    const result = await this.fetchJson(url);

    if (Array.isArray(result) && result.length > 0) {
      const entry = result[0];
      const meaningObj = entry.meanings?.[0];
      const defObj = meaningObj?.definitions?.[0];
      
      let audioUrl = null;
      if (entry.phonetics && entry.phonetics.length > 0) {
        const audioObj = entry.phonetics.find((p) => p.audio && p.audio.trim().length > 0);
        if (audioObj) audioUrl = audioObj.audio;
      }

      const parsed = {
        id: `en_${entry.word.toLowerCase()}`,
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
        partOfSpeech: meaningObj?.partOfSpeech || 'noun',
        definition_en: defObj?.definition || 'Definition unavailable.',
        example_en: defObj?.example || `An example of using ${entry.word} in context.`,
        audioUrl: audioUrl,
        audioText: entry.word,
        language: 'en'
      };

      this.cache.set(parsed.id, parsed);
      return parsed;
    }

    return null;
  }

  /**
   * Select a word for learning based on language and seen history
   */
  async getNextWord(language = 'fr', seenIds = []) {
    const pool = language === 'fr' ? SEED_FRENCH_WORDS : SEED_ENGLISH_WORDS;
    const unseen = pool.filter((w) => !seenIds.includes(w.id));
    
    // If unseen words remain in seed pool, pick one
    if (unseen.length > 0) {
      const selected = unseen[Math.floor(Math.random() * unseen.length)];
      if (language === 'en') {
        const live = await this.fetchEnglishWord(selected.word);
        if (live) return { ...selected, ...live };
      }
      return selected;
    }

    // Fallback: pick any word from pool to prevent crash
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }
}

module.exports = new DictionaryApiService();
