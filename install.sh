#!/bin/bash
# 1-Line Self-Sufficient Installer Script for Forced Vocabulary Immersion App on macOS

set -e

echo "--------------------------------------------------------"
echo "  Forced Vocabulary Immersion App - macOS Installer"
echo "--------------------------------------------------------"

# 1. Check and Install Node.js (Target: Node.js v20 LTS)
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Attempting to install Node.js v20..."
    
    if command -v brew &> /dev/null; then
        echo "Installing Node.js v20 via Homebrew..."
        brew install node@20
        brew link --overwrite node@20
    else
        echo "Error: Homebrew is not installed. Please install Node.js v20+ manually from https://nodejs.org/"
        exit 1
    fi
else
    NODE_VERSION=$(node -v)
    echo "Detected Node.js version: $NODE_VERSION"
fi

# 2. Install PM2 Globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 process manager globally..."
    npm install -g pm2
else
    echo "PM2 is already installed globally."
fi

# 3. Install Local Application Dependencies
echo "Installing local application npm dependencies..."
npm install

# 4. Configure Permissions
echo "Setting executable permissions for uninstall script..."
chmod +x ./uninstall.sh

echo "--------------------------------------------------------"
echo "✓ Installation Successful!"
echo ""
echo "  BACKGROUND DAEMON CONTROL COMMANDS:"
echo "  -----------------------------------"
echo "  Start background app:  pm2 start npm --name \"vocab-immersion\" -- start"
echo "  Stop background app:   pm2 stop vocab-immersion"
echo "  Show real-time logs:   pm2 logs vocab-immersion"
echo "  Status of app:         pm2 status"
echo ""
echo "  To uninstall cleanly:  ./uninstall.sh"
echo "--------------------------------------------------------"
