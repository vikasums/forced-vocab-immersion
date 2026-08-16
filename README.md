# Forced Vocabulary Immersion App (macOS & Web)

An ultra-focused, full-screen hourly vocabulary learning application for macOS and Web browsers designed to guarantee long-term vocabulary acquisition through non-intrusive yet impossible-to-ignore full-screen overlays.

---

## About

**Forced Vocabulary Immersion** is an hourly desktop learning enforcer. The application works by sliding a full-screen, highly aesthetic glassmorphic card over all active windows and desktop spaces once per hour, prompting you with a high-impact vocabulary word. To ensure consistent learning, the primary "I Understand" confirmation button is locked behind a mandatory **10-second viewing countdown**.

The system is designed to respect your workflow: it features an immediate **Cross (X) exit button**, automatic **Zoom/Google Meet active session suppression**, a **3-hour snooze toggle**, and **non-stacking sleep handling** (only 1 popup appears when you wake your laptop).

---

## Key Features

1. **Hourly Full-Screen Overlay**:
   - Covers all macOS workspaces and applications (`screen-saver` level bounds) without triggering native macOS space transitions (avoiding focus loss).
   - Enforces a mandatory **10-second viewing lock** on the confirmation button with a visual circular progress ring.
2. **Smart Meeting Guard & Snooze**:
   - **Cross (X) Close Button**: Accessible at the top-right corner, clickable from **0s** for emergency bypass.
   - **Meeting Protection**: Automatically queries active processes (`pgrep`) and browser tab contexts to suppress popups during active **Zoom** or **Google Meet** sessions.
   - **Pause for 3 Hours**: Quick snooze toggle available on the popup UI and the system tray menu.
   - **Manual Audio Playback**: Audios do not play automatically; a speaker icon speaks the word using macOS native `say` command with targeted accents (e.g. French `Amelie` or English `Samantha`).
3. **Dual-Language Configuration**:
   - **Default Target Language: English**.
   - Supports both English and French. French cards render dual-language entries (Word + Phonetic + both French & English definitions + French example sentences with English translations).
4. **Dynamic Public APIs & Spaced Repetition**:
   - Fetches vocabulary live via **Datamuse API**, **Free Dictionary API**, and **Wiktionary translation endpoints** and caches them locally for instant offline loading.
   - **Phase 1 (Week 1)**: Hourly new unique words.
   - **Phase 2 (Week 2+)**: Spaced Repetition (SM-2 Algorithm) revision popups + interactive multiple-choice quizzes.

---

## Quick Start & Usage

### 1. Installation
The installer script is self-sufficient. It automatically checks for Node.js, installs **Node.js v20 LTS** via Homebrew if missing, installs **PM2** globally, and sets up all local dependencies:
```bash
# Set executable permission and run installer
chmod +x ./install.sh
./install.sh
```

### 2. Run in Foreground (Testing)
To launch the app in the foreground to test the menubar tray icon and trigger overlay previews immediately:
```bash
npm start
```

### 3. Running in the Background (Production)

#### Method A: Using PM2 (Recommended)
PM2 runs the application persistently in the background, logs stdout/stderr, and restarts the process if it crashes:
```bash
# Start background daemon
pm2 start npm --name "vocab-immersion" -- start

# View running status
pm2 status

# View real-time logs (popup trigger times, meeting guard deferments)
pm2 logs vocab-immersion

# Stop the background process
pm2 stop vocab-immersion

# Delete process from PM2 list
pm2 delete vocab-immersion
```

#### Method B: macOS LaunchAgent Daemon
To register the app as a native macOS service that runs silently at startup:
1. Create a service description file in `~/Library/LaunchAgents/com.vocab.immersion.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.vocab.immersion</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/vikasanand/genAI/language-learning/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron</string> <!-- Path to local Electron binary -->
        <string>/Users/vikasanand/genAI/language-learning</string>
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

---

## Language Configuration

By default, the application runs in **English Mode**. 

To switch languages:
1. Click the blue graduation/book icon in the macOS menubar tray.
2. Hover over **Target Language**.
3. Select **French (Français)** or **English**.

The change will take effect immediately.

---

## Unit Testing
We maintain unit tests for dictionary API parsing, spaced repetition calculations, and meeting protection process matching.
```bash
# Execute Jest unit tests
npm test
```

---

## Uninstallation & Cleanup
To completely stop the daemon, delete auto-start items, and wipe local data leaving **zero system residues**:
```bash
# Execute clean uninstaller
./uninstall.sh
```

---

## Project Structure

```
/Users/vikasanand/genAI/language-learning/
├── package.json               # Dependencies, build configs, test scripts
├── main.js                    # Electron main process (tray app, meeting guard, sleep monitor)
├── preload.js                 # Safe IPC renderer bridge
├── install.sh                 # Self-sufficient macOS prerequisites installer
├── uninstall.sh               # 1-click clean uninstaller script
├── LICENSE                    # MIT License file
├── .agents/
│   └── AGENTS.md              # Project guidelines & memory
├── src/
│   ├── index.html             # Glassmorphic fullscreen overlay HTML layout
│   ├── styles.css             # Dark theme, typography & 10s progress ring CSS
│   ├── app.js                 # Front-end UI logic (countdown, audio, X close, 3h pause)
│   └── engine/
│       ├── dictionaryApi.js   # Live API Integration (FreeDictionary, Datamuse, Wiktionary)
│       ├── meetingGuard.js    # Zoom & Google Meet active call detector
│       ├── srs.js             # Spaced Repetition (SM-2) engine & Quiz generator
│       ├── macEnforcer.js     # Sleep/wake listener & screen bounds overlay options
│       └── logger.js          # Persistent log file & desktop notifier service
└── tests/
    └── unit/
        ├── dictionaryApi.test.js
        ├── srs.test.js
        └── meetingGuard.test.js
```

---

## License

This project is licensed under the [MIT License](LICENSE).
