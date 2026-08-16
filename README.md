# Forced Vocabulary Immersion App (macOS & Web)

An ultra-focused, full-screen hourly vocabulary learning application for macOS and Web browsers designed to guarantee long-term vocabulary acquisition through non-intrusive yet impossible-to-ignore full-screen overlays.

---

## Key Features

1. **Hourly Forced Full-Screen Overlay**:
   - Renders a floating glassmorphic full-screen card covering all macOS windows/spaces (`screen-saver` level).
   - Enforces a mandatory **10-second viewing lock** on the primary "I Understand" completion button.
2. **Instant Exit & Meeting Protection**:
   - **Cross (X) Close Button**: Placed at top-right corner, immediately clickable from **0s**.
   - **Zoom & Google Meet Guard**: Suppresses popups automatically during active Zoom calls or Google Meet browser sessions.
   - **Pause for 3 Hours**: One-click snooze toggle available on popup UI and tray menu.
   - **Manual Audio Playback**: High-quality MP3 audio pronunciation plays on demand (no auto-play).
3. **Dual-Language French & English Support**:
   - Configurable target language (French, English).
   - French entries feature the French word, phonetic transcription, **both French & English definitions**, and **French usage examples with English translations**.
4. **Dynamic Public APIs & Spaced Repetition**:
   - Real-time word fetching via **Datamuse API**, **Free Dictionary API**, and **Wiktionary translation endpoints**.
   - **Phase 1 (Week 1)**: Hourly new unique words (no repeats).
   - **Phase 2 (Week 2+)**: SuperMemo SM-2 Spaced Repetition revision popups + 4-option interactive mini-quizzes.
5. **Zero-Residue macOS Cleanup**:
   - Automated 1-click `uninstall.sh` removes menubar daemon, `~/Library/LaunchAgents/com.vocab.immersion.plist`, and data cache cleanly.

---

## Quick Start & Usage

### 1. Installation & Run
```bash
# Install dependencies
npm install

# Start the macOS Menubar Application
npm start
```

### 2. Running Unit Tests
```bash
# Execute Jest unit test suite
npm test
```

### 3. Uninstall & Cleanup
```bash
# Run 1-click clean uninstaller script
./uninstall.sh
```

---

## Architecture Overview

```
/Users/vikasanand/genAI/language-learning/
├── package.json               # Dependencies, build configs, test scripts
├── main.js                    # Electron main process (timer, tray app, meeting guard, sleep monitor)
├── preload.js                 # Safe IPC renderer bridge
├── install.sh                 # 1-line CLI installer
├── uninstall.sh               # 1-click clean uninstaller script
├── src/
│   ├── index.html             # Full-screen Popup UI HTML
│   ├── styles.css             # Glassmorphic Dark UI & 10s animation ring
│   ├── app.js                 # Front-end UI logic (countdown, audio player, X close, pause 3h)
│   └── engine/
│       ├── dictionaryApi.js   # Live API Integration (FreeDictionary API, Datamuse, Wiktionary)
│       ├── meetingGuard.js    # Zoom & Google Meet active call detector
│       ├── srs.js             # Spaced Repetition (SM-2) engine & Quiz generator
│       └── macEnforcer.js     # Sleep/wake listener & screen-saver level overlay
└── tests/
    └── unit/
        ├── dictionaryApi.test.js
        ├── srs.test.js
        └── meetingGuard.test.js
```
