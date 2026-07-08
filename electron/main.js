const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow;
let petServer;
const PET_PORT = 18923;

function createWindow() {
  // Center window on primary display
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    x: sw - 420,         // Right side of screen
    y: Math.floor(sh / 2 - 250),  // Vertically centered
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  // Open DevTools so you can see console
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Log renderer console to terminal
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer] ${message}`);
  });

  // Platform-specific window setup
  if (process.platform === 'darwin') {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } else if (process.platform === 'linux') {
    mainWindow.setVisibleOnAllWorkspaces(true);
  }

  // Default: receive mouse events so user can drag and right-click
  // Click-through can be toggled in settings (saved to localStorage)
}

function startPetServer() {
  petServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === 'POST' && req.url === '/pet/state') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const { state } = JSON.parse(body);
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('state-changed', state);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, state }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    if (req.method === 'GET' && req.url === '/pet/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  petServer.listen(PET_PORT, '127.0.0.1', () => {
    console.log(`[Claude Pet] Server listening on http://127.0.0.1:${PET_PORT}`);
  });
}

app.whenReady().then(() => {
  createWindow();
  startPetServer();

  // IPC handlers
  ipcMain.handle('set-state', (_, state) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('state-changed', state);
    }
    return { ok: true };
  });

  ipcMain.handle('save-settings', (_, settings) => {
    const fs = require('fs');
    const settingsPath = path.join(app.getPath('userData'), 'claude-pet-settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return { ok: true };
  });

  ipcMain.handle('load-settings', () => {
    const fs = require('fs');
    const settingsPath = path.join(app.getPath('userData'), 'claude-pet-settings.json');
    try {
      if (fs.existsSync(settingsPath)) {
        return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      }
    } catch (e) {}
    return {};
  });

  ipcMain.handle('set-ignore-mouse', (_, ignore) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
    }
    return { ok: true };
  });

  ipcMain.handle('get-port', () => {
    return PET_PORT;
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (petServer) petServer.close();
});
