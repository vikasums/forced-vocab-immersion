/**
 * Meeting Guard Module
 * Detects active Zoom app processes or Google Meet browser sessions to protect user meetings.
 * Uses exact process matching to avoid false positives from project files/arguments.
 */

const { exec } = require('child_process');

class MeetingGuardService {
  constructor() {
    // Exact process names to check
    this.meetingProcesses = [
      'zoom.us',
      'zoom',
      'Teams',
      'Microsoft Teams',
      'Skype',
      'Webex'
    ];
  }

  /**
   * Check if any meeting process is running using exact name matching with ERE regex
   */
  checkExactProcesses() {
    return new Promise((resolve) => {
      // Join process names with pipe (|) for ERE matching in pgrep
      const pattern = this.meetingProcesses.join('|');
      exec(`pgrep -x "${pattern}"`, (err, stdout) => {
        if (!err && stdout && stdout.trim().length > 0) {
          resolve(true); // Found active meeting process
          return;
        }
        resolve(false);
      });
    });
  }

  /**
   * Fallback process list check that excludes our own project paths/arguments
   */
  checkProcessListFallback() {
    return new Promise((resolve) => {
      exec('ps aux', (err, stdout) => {
        if (err || !stdout) {
          resolve(false);
          return;
        }

        const lines = stdout.toLowerCase().split('\n');
        const isMeetingRunning = lines.some((line) => {
          // Ignore our own project daemon/runner processes
          if (line.includes('forced-vocab-immersion') || line.includes('node') || line.includes('electron')) {
            return false;
          }

          // Check if line contains meet.google.com in a browser/network context
          return (
            line.includes('meet.google.com') ||
            line.includes('google meet')
          );
        });

        resolve(isMeetingRunning);
      });
    });
  }

  /**
   * Main check function called before opening full-screen popups
   */
  async isUserInMeeting() {
    try {
      // 1. Check exact process names first (highly reliable, no false positives)
      const processActive = await this.checkExactProcesses();
      if (processActive) return true;

      // 2. Check fallback process list for Google Meet browser tabs (excluding own process)
      const fallbackActive = await this.checkProcessListFallback();
      return fallbackActive;
    } catch (e) {
      return false;
    }
  }
}

module.exports = new MeetingGuardService();
