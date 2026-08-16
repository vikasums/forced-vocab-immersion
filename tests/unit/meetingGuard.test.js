const meetingGuard = require('../../src/engine/meetingGuard');

describe('MeetingGuardService Unit Tests', () => {
  test('isUserInMeeting returns a boolean', async () => {
    const result = await meetingGuard.isUserInMeeting();
    expect(typeof result).toBe('boolean');
  });

  test('meetingProcesses array contains Zoom and Teams', () => {
    expect(meetingGuard.meetingProcesses).toContain('zoom.us');
    expect(meetingGuard.meetingProcesses).toContain('Teams');
  });
});
