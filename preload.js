/**
 * Safe Preload IPC Bridge
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow: () => ipcRenderer.send('CLOSE_WINDOW'),
  confirmWord: (wordId) => ipcRenderer.send('CONFIRM_WORD', wordId),
  snooze3Hours: () => ipcRenderer.send('SNOOZE_3H'),
  playAudioFallback: (text, lang) => ipcRenderer.send('PLAY_AUDIO_FALLBACK', { text, lang }),
  onLoadWord: (callback) => ipcRenderer.on('LOAD_WORD', (event, data) => callback(data))
});
