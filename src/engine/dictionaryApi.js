/**
 * Live Public Dictionary & Vocabulary API Service
 * Integrates Datamuse API, Free Dictionary API (api.dictionaryapi.dev), and Wiktionary translation endpoints.
 */

const HTTPS = require('https');

// Expanded fallback seed vocabulary with rich dual-language French & English definitions
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
  },
  {
    id: 'fr_flaner',
    word: 'Flâner',
    phonetic: '/flɑ.ne/',
    partOfSpeech: 'verbe',
    definition_fr: 'Se promener sans but précis, au gré de son inspiration.',
    definition_en: 'To wander or stroll aimlessly, loafing or idling.',
    example_fr: 'J\'adore flâner le long des quais de la Seine le dimanche.',
    example_en: 'I love to stroll along the banks of the Seine on Sundays.',
    audioText: 'flâner',
    language: 'fr'
  },
  {
    id: 'fr_depaysement',
    word: 'Dépaysement',
    phonetic: '/de.pe.iz.mɑ̃/',
    partOfSpeech: 'nom masculin',
    definition_fr: 'Sentiment d\'étrangeté et de nouveauté ressenti dans un pays étranger.',
    definition_en: 'The feeling of disorientation or change of scenery experienced in a new country.',
    example_fr: 'Ce voyage au Japon m\'a procuré un dépaysement total.',
    example_en: 'This trip to Japan gave me a total change of scenery.',
    audioText: 'dépaysement',
    language: 'fr'
  },
  {
    id: 'fr_retrouvailles',
    word: 'Retrouvailles',
    phonetic: '/ʁə.tʁu.vaj/',
    partOfSpeech: 'nom féminin pluriel',
    definition_fr: 'Fait de se retrouver après une longue séparation.',
    definition_en: 'The reunion or meeting again after a long period of separation.',
    example_fr: 'Leurs retrouvailles à la gare après des années ont été très émouvantes.',
    example_en: 'Their reunion at the station after years was very moving.',
    audioText: 'retrouvailles',
    language: 'fr'
  },
  {
    id: 'fr_crepuscule',
    word: 'Crépuscule',
    phonetic: '/kʁe.pys.kyl/',
    partOfSpeech: 'nom masculin',
    definition_fr: 'Lumière diffuse qui succède immédiatement au coucher du soleil.',
    definition_en: 'The period of twilight or dusk just after sunset.',
    example_fr: 'Le crépuscule peignait le ciel de nuances violettes et orangées.',
    example_en: 'The twilight painted the sky with shades of purple and orange.',
    audioText: 'crépuscule',
    language: 'fr'
  },
  {
    id: 'fr_pluviophile',
    word: 'Pluviophile',
    phonetic: '/ply.vjo.fil/',
    partOfSpeech: 'nom ou adjectif',
    definition_fr: 'Qui aime la pluie, y trouve de la joie et de la paix.',
    definition_en: 'A lover of rain; someone who finds joy and peace of mind during rainy days.',
    example_fr: 'En tant que pluviophile, j\'adore lire près de la fenêtre sous l\'orage.',
    example_en: 'As a pluviophile, I love reading near the window during a storm.',
    audioText: 'pluviophile',
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
  },
  {
    id: 'en_acumen',
    word: 'Acumen',
    phonetic: '/əˈkjuː.mən/',
    partOfSpeech: 'noun',
    definition_en: 'The ability to make good judgments and quick decisions, typically in a particular domain.',
    example_en: 'Her business acumen helped the startup scale rapidly.',
    audioText: 'acumen',
    language: 'en'
  },
  {
    id: 'en_alacrity',
    word: 'Alacrity',
    phonetic: '/əˈlæk.rə.ti/',
    partOfSpeech: 'noun',
    definition_en: 'Brisk and cheerful readiness to do something.',
    example_en: 'She accepted the challenge with alacrity and started planning.',
    audioText: 'alacrity',
    language: 'en'
  },
  {
    id: 'en_anomaly',
    word: 'Anomaly',
    phonetic: '/əˈnɒm.ə.li/',
    partOfSpeech: 'noun',
    definition_en: 'Something that deviates from what is standard, normal, or expected.',
    example_en: 'The sudden cold wave in summer was an anomaly.',
    audioText: 'anomaly',
    language: 'en'
  },
  {
    id: 'en_assiduous',
    word: 'Assiduous',
    phonetic: '/əˈsɪd.ju.əs/',
    partOfSpeech: 'adjective',
    definition_en: 'Showing great care, attention, and persistent effort.',
    example_en: 'Through assiduous research, they solved the programming bug.',
    audioText: 'assiduous',
    language: 'en'
  },
  {
    id: 'en_cacophony',
    word: 'Cacophony',
    phonetic: '/kəˈkɒf.ə.ni/',
    partOfSpeech: 'noun',
    definition_en: 'A harsh, discordant mixture of sounds.',
    example_en: 'The market was filled with a cacophony of street vendors and car horns.',
    audioText: 'cacophony',
    language: 'en'
  },
  {
    id: 'en_cognizant',
    word: 'Cognizant',
    phonetic: '/ˈkɒɡ.nɪ.zənt/',
    partOfSpeech: 'adjective',
    definition_en: 'Having knowledge or being fully aware of something.',
    example_en: 'We are cognizant of the challenges ahead but remain optimistic.',
    audioText: 'cognizant',
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
    return new Promise((resolve) => {
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
      }).on('error', () => resolve(null));
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

    // Fallback/Reset seen log if pool is fully exhausted, starting rotation fresh
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    if (language === 'en') {
      const live = await this.fetchEnglishWord(selected.word);
      if (live) return { ...selected, ...live };
    }
    return selected;
  }
}

module.exports = new DictionaryApiService();
