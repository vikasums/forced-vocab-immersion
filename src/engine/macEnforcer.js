/**
 * macOS Enforcer & Sleep Listener Engine
 * Manages screen saver level window options and system sleep/wake event listeners.
 */

class MacEnforcerService {
  constructor() {
    this.lastWakeTime = Date.now();
    this.snoozeUntil = 0;
  }

  getOverlayWindowOptions() {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;

    return {
      x: 0,
      y: 0,
      width: width,
      height: height,
      fullscreen: false, // Turn off native fullscreen space behavior to prevent auto-hide
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      resizable: false,
      movable: false,
      hasShadow: false,
      enableLargerThanScreen: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: require('path').join(__dirname, '../../preload.js')
      }
    };
  }

  /**
   * Apply macOS screen saver window level
   */
  applyMacWindowLevel(win) {
    if (!win) return;
    try {
      win.setAlwaysOnTop(true, 'screen-saver');
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    } catch (e) {
      // Fallback for non-macOS environments
      win.setAlwaysOnTop(true, 'floating');
    }
  }

  /**
   * Snooze popups for 3 hours
   */
  setSnooze3Hours() {
    this.snoozeUntil = Date.now() + 3 * 60 * 60 * 1000;
  }

  /**
   * Check if currently snoozed
   */
  isSnoozed() {
    return Date.now() < this.snoozeUntil;
  }

  /**
   * Get remaining snooze time in minutes
   */
  getRemainingSnoozeMinutes() {
    if (!this.isSnoozed()) return 0;
    return Math.ceil((this.snoozeUntil - Date.now()) / (60 * 1000));
  }
}

module.exports = new MacEnforcerService();
