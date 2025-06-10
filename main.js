const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    fullscreen: false,
    backgroundColor: '#000000',
  });

  win.loadFile('renderer/index.html');
}

app.whenReady().then(createWindow);
