const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

//モジュール
const createMenu = require("./modules/menu.js")


// ウィンドウを作成する関数
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.webContents.openDevTools();

  // メインHTMLファイルをブラウザウィンドウに読み込ませる
  mainWindow.loadFile('index.html');

  //menuを作成
  createMenu(mainWindow);

  // ウィンドウが閉じられたときのイベントリスナー
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// アプリが起動したときに新しいウィンドウを作成するイベントリスナー
app.on('ready', createWindow);

// すべてのウィンドウが閉じられたときにアプリを終了するイベントリスナー
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// アプリがアクティブ化され、開いているウィンドウがない場合に新しいウィンドウを作成するイベントリスナー
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});


// IPCハンドラー：ファイルを開いてその内容を返す
ipcMain.handle('open-file', async (_, filePath) => { 
  const content = fs.readFileSync(filePath, 'utf-8'); return JSON.parse(content); 
});

// IPCハンドラー：ファイルの内容をディスクに保存する
ipcMain.handle('save-file', async (_, content, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2)); // 指定されたファイルパスにコンテンツを書き込む
});

// IPCハンドラー：別名でファイルの内容をディスクに保存する
// ipcMain.handle('save-file-as', async (_, content) => {
//     console.log(_)
//     fs.writeFileSync(result.filePath, JSON.stringify(content, null, 2));
// });




