const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  setState: (state) => ipcRenderer.invoke('set-state', state),
  onStateChange: (callback) => {
    ipcRenderer.on('state-changed', (_, state) => callback(state));
  },
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  setIgnoreMouse: (ignore) => ipcRenderer.invoke('set-ignore-mouse', ignore),
  getPort: () => ipcRenderer.invoke('get-port')
});
