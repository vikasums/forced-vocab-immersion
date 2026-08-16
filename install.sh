#!/bin/bash
# 1-Line Installer Script for Forced Vocabulary Immersion App on macOS

set -e

echo "--------------------------------------------------------"
echo "  Forced Vocabulary Immersion App - macOS Installer"
echo "--------------------------------------------------------"

# Check Node.js requirement
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required. Please install Node.js (v18+) to proceed."
    exit 1
fi

echo "Installing npm dependencies..."
npm install

echo "Setting executable permissions for uninstall script..."
chmod +x ./uninstall.sh

echo "--------------------------------------------------------"
echo "✓ Installation Successful!"
echo "  To start the app: npm start"
echo "  To uninstall:     ./uninstall.sh"
echo "--------------------------------------------------------"
