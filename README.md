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
The installer script automatically checks/installs Node.js (v20), installs PM2 globally, and resolves all application dependencies:
```bash
# Run the self-sufficient installer
chmod +x ./install.sh
./install.sh

# Start the macOS Menubar Application in the foreground
npm start
```

### 2. Running in the Background (Node.js & macOS Services)

#### Method A: Process Manager (PM2)
PM2 is a robust Node.js process manager to keep the app running persistently in the background:
```bash
# Install PM2 globally
npm install -g pm2

# Start the Electron App silently in the background
pm2 start "npm" --name "vocab-immersion" -- start

# View running status
pm2 status

# Monitor live app logs
pm2 logs vocab-immersion

# Stop the background daemon
pm2 stop vocab-immersion
```

#### Method B: macOS LaunchAgent Daemon
To run it natively on boot using macOS's built-in service scheduler (equivalent to Homebrew services):
1. Create a service file in `~/Library/LaunchAgents/com.vocab.immersion.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.vocab.immersion</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string> <!-- Path to your Node binary -->
        <string>/Users/vikasanand/genAI/language-learning/main.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/vikasanand/Library/Logs/vocab-immersion-out.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/vikasanand/Library/Logs/vocab-immersion-err.log</string>
</dict>
</plist>
```
2. Load and start the background agent:
```bash
launchctl load ~/Library/LaunchAgents/com.vocab.immersion.plist
```
3. Stop/Unload the agent:
```bash
launchctl unload ~/Library/LaunchAgents/com.vocab.immersion.plist
```

### 3. Running Unit Tests
```bash
# Execute Jest unit test suite
npm test
```

### 4. Uninstall & Cleanup
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
