const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let currentFilePath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              filters: [{ name: 'JSON', extensions: ['json'] }],
              properties: ['openFile'],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('open-file', result.filePaths[0]);
              mainWindow.setTitle(path.basename(result.filePaths[0]));
              currentFilePath = result.filePaths[0];
            }
          },
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (currentFilePath) {
              mainWindow.webContents.send('save-content', currentFilePath);
            } else {
              mainWindow.webContents.send('save-content');
            }
          },
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [{ name: 'JSON', extensions: ['json'] }],
            });
            if (!result.canceled) {
              mainWindow.webContents.send('save-content-as', result.filePath);
              mainWindow.setTitle(path.basename(result.filePath));
              currentFilePath = result.filePath;
            }
          },
        },
      ],
    },
  ]);  
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('save-file', async (_, content, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
});

ipcMain.handle('save-file-as', async (_, content) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters:[{ name: 'JSON', extensions: ['json'] }],
  }); if (!result.canceled) { fs.writeFileSync(result.filePath, JSON.stringify(content, null, 2)); mainWindow.setTitle(path.basename(result.filePath)); } });
  
  ipcMain.handle('open-file', async (_, filePath) => { const content = fs.readFileSync(filePath, 'utf-8'); return JSON.parse(content); });