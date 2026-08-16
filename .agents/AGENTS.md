# Workspace Guidelines & Project Memory

## Project Overview: Forced Vocabulary Immersion App
A full-screen hourly vocabulary learning application for macOS & Web with spaced repetition, dual-language support, and smart meeting suppression.

## Architectural Recommendations & Key Decisions

1. **Delivery Format**:
   - **Primary**: macOS Menubar Tray Application (Electron) to enable full-screen overlays over all macOS desktops/spaces and monitor native system events (sleep/wake, active Zoom/Meet calls).
   - **Secondary**: Chrome Web Extension / Web app mode for in-browser usage.

2. **Vocabulary Data & Public APIs**:
   - Dynamic API integration using **Datamuse API** and **Free Dictionary API** (`api.dictionaryapi.dev`) for English.
   - **Wiktionary API & Translation services** for French dual-language entries (both French and English definitions + translated usage examples).
   - Local SQLite / Storage caching to ensure instant offline popup rendering.

3. **User Experience & Forced Learning Enforcement**:
   - **10-Second Countdown Lock**: Applied strictly to the "I Understand" confirmation button.
   - **Instant Cross (X) Close Button**: Placed at top-right corner, clickable from **0s**.
   - **Meeting Protection Guard**: Suppresses popups during active **Zoom** or **Google Meet** sessions.
   - **Pause for 3 Hours**: Quick snooze toggle on popup and tray icon.
   - **Manual Audio Playback**: Speaker button plays audio MP3 on click; **no auto-play**.
   - **Laptop Sleep Handling**: Non-stacking popup queue (shows 1 word on wake).
   - **30-Minute Timeout**: Auto-dismisses unattended overlays after 30 minutes.

4. **Distribution & Cleanup**:
   - **macOS Installer**: `.dmg`/`.pkg` signed with Apple Developer ID and notarized via `xcrun notarytool`.
   - **Terminal Installation**: Homebrew Cask (`brew install --cask forced-vocab-immersion`) and 1-line curl script.
   - **Zero-Residue Cleanup**: Automated `uninstall.sh` removes menubar daemon, `~/Library/LaunchAgents/com.vocab.immersion.plist`, and data directories cleanly.

5. **Testing Strategy**:
   - 4-Tiered Testing: Tier 1 Unit (APIs, SM-2 math, regex), Tier 2 Integration (IPC, 3h pause state), Tier 3 E2E (Playwright 10s ring & X button), Tier 4 System OS (macOS sleep/wake & meeting guard).
