/**
 * Electron Main Process & Menubar Daemon
 * Manages tray icon, hourly timers, macOS sleep/wake events, meeting protection guard, and full-screen overlays.
 */

const { app, BrowserWindow, ipcMain, Tray, Menu, powerMonitor, nativeImage } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const dictionaryApi = require('./src/engine/dictionaryApi');
const meetingGuard = require('./src/engine/meetingGuard');
const srs = require('./src/engine/srs');
const macEnforcer = require('./src/engine/macEnforcer');
const logger = require('./src/engine/logger');

let overlayWindow = null;
let tray = null;
let hourlyInterval = null;
let targetLanguage = 'en'; // Default target language: English

/**
 * Trigger full-screen vocabulary popup
 */
async function triggerVocabularyPopup() {
  try {
    // Check if snoozed
    if (macEnforcer.isSnoozed()) {
      logger.info(`[VocabApp] Snoozed for next ${macEnforcer.getRemainingSnoozeMinutes()} mins. Skipping popup.`);
      return;
    }

    // Check Meeting Protection Guard (Zoom / Google Meet)
    const isMeeting = await meetingGuard.isUserInMeeting();
    if (isMeeting) {
      logger.info('[VocabApp] Meeting detected (Zoom/Google Meet). Postponing popup.');
      return;
    }

    // Fetch next word
    const seenIds = srs.getSeenWordIds();
    const wordData = await dictionaryApi.getNextWord(targetLanguage, seenIds);

    if (!wordData) {
      logger.error('Failed to retrieve next vocabulary word from dictionary API.', null, true);
      return;
    }

    logger.info(`[VocabApp] Triggering popup for word: ${wordData.word} (${wordData.language})`);

    // Create or show overlay window
    if (!overlayWindow || overlayWindow.isDestroyed()) {
      const opts = macEnforcer.getOverlayWindowOptions();
      overlayWindow = new BrowserWindow(opts);
      macEnforcer.applyMacWindowLevel(overlayWindow);

      overlayWindow.loadFile(path.join(__dirname, 'src/index.html'));

      overlayWindow.webContents.on('did-finish-load', () => {
        overlayWindow.webContents.send('LOAD_WORD', wordData);
        overlayWindow.show();
        overlayWindow.focus();
        logger.info(`[VocabApp] Fullscreen overlay window opened successfully for word: ${wordData.word}`);
      });

      // Trace window state changes
      overlayWindow.on('blur', () => {
        logger.info('[VocabApp] Overlay window lost focus (blur).');
      });

      overlayWindow.on('minimize', () => {
        logger.info('[VocabApp] Overlay window minimized.');
      });

      overlayWindow.on('hide', () => {
        logger.info('[VocabApp] Overlay window hidden.');
      });

      overlayWindow.on('close', () => {
        logger.info('[VocabApp] Overlay window closing event triggered.');
      });

      overlayWindow.on('closed', () => {
        logger.info('[VocabApp] Overlay window closed.');
        overlayWindow = null;
      });

      overlayWindow.webContents.on('render-process-gone', (event, details) => {
        logger.error(`[VocabApp] Renderer process crashed: ${details.reason} (${details.exitCode})`, null, true);
      });

      overlayWindow.on('unresponsive', () => {
        logger.error('Overlay window became unresponsive!', null, true);
      });
    } else {
      overlayWindow.webContents.send('LOAD_WORD', wordData);
      overlayWindow.show();
      overlayWindow.focus();
      logger.info(`[VocabApp] Overlay window reuse successful. Showing word: ${wordData.word}`);
    }
  } catch (err) {
    logger.error('Error during triggerVocabularyPopup execution', err, true);
  }
}

/**
 * Setup Menubar Tray Icon
 */
function createTray() {
  try {
    const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAAEVJREFUOE9jGDTAyMj4nwFM/GMAA5CksYExigEwQ5BsGFUDEIYhWTDyBqC5AncDkGwYVQMQQ5DsGJoGgAzB629CJgaQDQcMAGh4E18P/M1cAAAAAElFTkSuQmCC';
    const icon = nativeImage.createFromBuffer(Buffer.from(base64Png, 'base64'));
    
    tray = new Tray(icon);
    tray.setToolTip('Forced Vocabulary Immersion App');
    updateTrayMenu();
    logger.info('[VocabApp] System tray menu created successfully.');
  } catch (err) {
    logger.error('Failed to create system tray icon', err, false);
  }
}

function updateTrayMenu() {
  const isSnoozed = macEnforcer.isSnoozed();
  const snoozeText = isSnoozed 
    ? `Snoozed (${macEnforcer.getRemainingSnoozeMinutes()}m remaining)`
    : 'Pause for 3 Hours';

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Vocabulary Now',
      click: () => triggerVocabularyPopup()
    },
    {
      label: snoozeText,
      enabled: !isSnoozed,
      click: () => {
        macEnforcer.setSnooze3Hours();
        updateTrayMenu();
        logger.info('[VocabApp] Snoozed popups for 3 hours from menubar.');
      }
    },
    { type: 'separator' },
    {
      label: 'Target Language',
      submenu: [
        {
          label: 'French (Français)',
          type: 'radio',
          checked: targetLanguage === 'fr',
          click: () => { 
            targetLanguage = 'fr'; 
            updateTrayMenu(); 
            logger.info('[VocabApp] Changed target language to French.');
          }
        },
        {
          label: 'English',
          type: 'radio',
          checked: targetLanguage === 'en',
          click: () => { 
            targetLanguage = 'en'; 
            updateTrayMenu(); 
            logger.info('[VocabApp] Changed target language to English.');
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Quit Vocab Immersion',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
}

/**
 * Setup System Sleep/Wake Listener & Hourly Scheduler
 */
function setupAppLifecycle() {
  // Initialize file logger
  logger.init();
  logger.info('[VocabApp] PERSISTENT BACKGROUND DAEMON STARTED');

  createTray();

  // Hourly Timer (3600000ms = 1 hour)
  hourlyInterval = setInterval(() => {
    logger.info('[VocabApp] Hourly timer tick triggered.');
    triggerVocabularyPopup();
  }, 60 * 60 * 1000);

  // Monitor macOS Sleep / Wake events
  powerMonitor.on('suspend', () => {
    logger.info('[VocabApp] System going to sleep. Suspending timers.');
  });

  powerMonitor.on('resume', () => {
    logger.info('[VocabApp] System woke up from sleep. Showing 1 catch-up popup.');
    setTimeout(() => {
      triggerVocabularyPopup();
    }, 5000); // 5s delay after wake
  });

  // Initial popup trigger on launch
  setTimeout(() => {
    triggerVocabularyPopup();
  }, 2000);
}

// IPC Handlers
ipcMain.on('CLOSE_WINDOW', () => {
  logger.info('[VocabApp] Renderer requested close window (X button clicked).');
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }
});

ipcMain.on('CONFIRM_WORD', (event, wordId) => {
  logger.info(`[VocabApp] User confirmed understanding of word ID: ${wordId}`);
  if (wordId) {
    srs.markSeen(wordId);
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }
});

ipcMain.on('SNOOZE_3H', () => {
  logger.info('[VocabApp] User requested Pause for 3 Hours from overlay UI.');
  macEnforcer.setSnooze3Hours();
  updateTrayMenu();
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }
});

ipcMain.on('PLAY_AUDIO_FALLBACK', (event, { text, lang }) => {
  logger.info(`[VocabApp] Playing native macOS say fallback for: ${text} (${lang})`);
  const voice = lang === 'fr' ? 'Amelie' : 'Samantha';
  const safeText = text.replace(/"/g, '\\"');
  
  exec(`say -v ${voice} "${safeText}"`, (err) => {
    if (err) {
      // Fallback to default system voice if specific voice is not installed
      exec(`say "${safeText}"`, (err2) => {
        if (err2) {
          logger.error('macOS say command audio fallback failed', err2, false);
        }
      });
    }
  });
});

// App lifecycle
app.whenReady().then(setupAppLifecycle);

app.on('window-all-closed', (e) => {
  // Prevent app from quitting when overlay closes; keep menubar tray alive
  e.preventDefault();
});
