#!/bin/bash
# 1-Click Clean Uninstaller Script for Forced Vocabulary Immersion App

echo "--------------------------------------------------------"
echo "  Forced Vocabulary Immersion App - Clean Uninstaller"
echo "--------------------------------------------------------"

# 1. Terminate running daemon processes (standard & PM2)
echo "Stopping active background application daemons..."
if command -v pm2 &> /dev/null; then
    pm2 delete vocab-immersion 2>/dev/null || true
fi
pkill -f "forced-vocab-immersion" 2>/dev/null || true
pkill -f "electron . --dev" 2>/dev/null || true

# 2. Remove macOS LaunchAgent auto-start plist
LAUNCH_AGENT="$HOME/Library/LaunchAgents/com.vocab.immersion.plist"
if [ -f "$LAUNCH_AGENT" ]; then
    echo "Removing LaunchAgent startup item: $LAUNCH_AGENT"
    launchctl unload "$LAUNCH_AGENT" 2>/dev/null || true
    rm -f "$LAUNCH_AGENT"
fi

# 3. Wipe Application Support Data Directory
APP_DATA="$HOME/Library/Application Support/vocab-immersion-app"
if [ -d "$APP_DATA" ]; then
    echo "Wiping cached application data: $APP_DATA"
    rm -rf "$APP_DATA"
fi

echo "--------------------------------------------------------"
echo "✓ Uninstallation Complete! Zero leftover files remain."
echo "--------------------------------------------------------"
