/**
 * Application Logger & Native Notification Utility
 * Writes logs to console and persistently to the user's App Data directory.
 * Dispatches native macOS notifications for critical events or errors.
 */

const { app, Notification } = require('electron');
const fs = require('fs');
const path = require('path');

class LoggerService {
  constructor() {
    this.logFile = null;
  }

  /**
   * Initialize log file path in App Data directory
   */
  init() {
    try {
      // Get standard OS application support directory
      const appDataDir = app.getPath('userData');
      if (!fs.existsSync(appDataDir)) {
        fs.mkdirSync(appDataDir, { recursive: true });
      }
      this.logFile = path.join(appDataDir, 'app.log');
      this.info('Logger initialized. Log file path: ' + this.logFile);
    } catch (e) {
      console.error('Failed to initialize logger file path', e);
    }
  }

  /**
   * Log info messages
   */
  info(message) {
    this.write('INFO', message);
  }

  /**
   * Log error messages and optionally trigger system notification
   */
  error(message, errorObj = null, notifyUser = false) {
    let logMsg = message;
    if (errorObj) {
      logMsg += ` | Error: ${errorObj.message || errorObj}`;
      if (errorObj.stack) {
        logMsg += `\nStack Trace:\n${errorObj.stack}`;
      }
    }
    this.write('ERROR', logMsg);

    if (notifyUser) {
      this.notify('Error Alert', message);
    }
  }

  /**
   * Helper to append log lines with timestamps
   */
  write(level, message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}\n`;
    
    // Output to stdout/stderr
    if (level === 'ERROR') {
      console.error(logLine.trim());
    } else {
      console.log(logLine.trim());
    }

    // Append to file if initialized
    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, logLine);
      } catch (e) {
        console.error('Failed writing to log file', e);
      }
    }
  }

  /**
   * Send native OS desktop notification
   */
  notify(title, body) {
    try {
      if (Notification.isSupported()) {
        const notification = new Notification({
          title: `Vocab Immersion: ${title}`,
          body: body,
          silent: false
        });
        notification.show();
      }
    } catch (e) {
      this.write('WARNING', 'Failed to dispatch desktop notification: ' + e.message);
    }
  }
}

module.exports = new LoggerService();
