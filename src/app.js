/**
 * Renderer Front-End Logic for Fullscreen Vocabulary Overlay
 */

let countdownSeconds = 10;
let countdownTimer = null;
let autoTimeoutTimer = null;
let currentWordData = null;

// DOM Elements
const closeBtn = document.getElementById('closeBtn');
const confirmBtn = document.getElementById('confirmBtn');
const pauseBtn = document.getElementById('pauseBtn');
const audioBtn = document.getElementById('audioBtn');
const timerText = document.getElementById('timerText');
const progressCircle = document.getElementById('progressCircle');

const wordTitle = document.getElementById('wordTitle');
const wordPhonetic = document.getElementById('wordPhonetic');
const defFr = document.getElementById('defFr');
const defEn = document.getElementById('defEn');
const exFr = document.getElementById('exFr');
const exEn = document.getElementById('exEn');
const languageBadge = document.getElementById('languageBadge');

/**
 * Start the mandatory 10-second viewing timer lock
 */
function start10sCountdown() {
  countdownSeconds = 10;
  confirmBtn.disabled = true;
  confirmBtn.textContent = `I Understand (${countdownSeconds}s)`;
  timerText.textContent = countdownSeconds;

  const circumference = 2 * Math.PI * 20; // r=20 -> 125.6
  progressCircle.style.strokeDasharray = `${circumference}`;
  progressCircle.style.strokeDashoffset = '0';

  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    countdownSeconds -= 1;
    timerText.textContent = countdownSeconds > 0 ? countdownSeconds : '✓';

    const offset = circumference - (countdownSeconds / 10) * circumference;
    progressCircle.style.strokeDashoffset = `${offset}`;

    if (countdownSeconds <= 0) {
      clearInterval(countdownTimer);
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'I Understand';
    } else {
      confirmBtn.textContent = `I Understand (${countdownSeconds}s)`;
    }
  }, 1000);
}

/**
 * Start 30-minute auto-dismiss safety timeout
 */
function start30mAutoTimeout() {
  if (autoTimeoutTimer) clearTimeout(autoTimeoutTimer);
  autoTimeoutTimer = setTimeout(() => {
    closeOverlay();
  }, 30 * 60 * 1000); // 30 minutes
}

/**
 * Close overlay window cleanly
 */
function closeOverlay() {
  if (window.electronAPI && window.electronAPI.closeWindow) {
    window.electronAPI.closeWindow();
  } else {
    window.close();
  }
}

/**
 * Render word data onto UI cards
 */
function renderWord(wordObj) {
  if (!wordObj) return;
  currentWordData = wordObj;

  wordTitle.textContent = wordObj.word || 'Vocabulary';
  wordPhonetic.textContent = wordObj.phonetic || '';
  
  if (wordObj.language === 'fr') {
    languageBadge.textContent = 'French (Français)';
    defFr.textContent = wordObj.definition_fr || 'Définition indisponible.';
    defEn.textContent = wordObj.definition_en || 'English meaning unavailable.';
    exFr.textContent = wordObj.example_fr ? `"${wordObj.example_fr}"` : '';
    exEn.textContent = wordObj.example_en ? `"${wordObj.example_en}"` : '';
  } else {
    languageBadge.textContent = 'English';
    defFr.parentElement.style.display = 'none';
    defEn.textContent = wordObj.definition_en || 'Definition unavailable.';
    exFr.style.display = 'none';
    exEn.textContent = wordObj.example_en ? `"${wordObj.example_en}"` : '';
  }

  start10sCountdown();
  start30mAutoTimeout();
}

/**
 * Play Audio Pronunciation manually on button click (NO auto-play)
 */
function playAudio() {
  if (!currentWordData) return;

  // Use macOS native say command via IPC if available (extremely robust & offline compatible)
  if (window.electronAPI && window.electronAPI.playAudioFallback) {
    window.electronAPI.playAudioFallback(currentWordData.audioText || currentWordData.word, currentWordData.language);
  } else {
    // Fallback to Web Speech API in browser mode
    playSpeechSynthesis();
  }
}

function playSpeechSynthesis() {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(currentWordData.audioText || currentWordData.word);
    utterance.lang = currentWordData.language === 'fr' ? 'fr-FR' : 'en-US';
    speechSynthesis.speak(utterance);
  }
}

// Event Listeners

// Top-Right Immediate Cross (X) Close Button (0s clickable)
closeBtn.addEventListener('click', () => {
  closeOverlay();
});

// Primary Confirmation Button
confirmBtn.addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.confirmWord) {
    window.electronAPI.confirmWord(currentWordData?.id);
  }
  closeOverlay();
});

// Pause for 3 Hours Button
pauseBtn.addEventListener('click', () => {
  if (window.electronAPI && window.electronAPI.snooze3Hours) {
    window.electronAPI.snooze3Hours();
  }
  closeOverlay();
});

// Speaker Button Manual Audio Playback
audioBtn.addEventListener('click', () => {
  playAudio();
});

// IPC Listener from Main Process
if (window.electronAPI && window.electronAPI.onLoadWord) {
  window.electronAPI.onLoadWord((data) => {
    renderWord(data);
  });
} else {
  // Default mock render for web standalone testing
  renderWord({
    id: 'fr_ephemere',
    word: 'Éphémère',
    phonetic: '/e.fe.mɛʁ/',
    language: 'fr',
    definition_fr: 'Qui ne dure que très peu de temps; passager et fugace.',
    definition_en: 'Lasting for a very short time; ephemeral or fleeting.',
    example_fr: 'La beauté des fleurs de cerisier est merveilleuse mais éphémère.',
    example_en: 'The beauty of cherry blossoms is wonderful but ephemeral.'
  });
}
