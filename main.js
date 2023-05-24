// Electronから必要なモジュールや関数をインポート
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

// 後で使用するために変数を宣言
let mainWindow;
let currentFilePath = null;

// ウィンドウを作成する関数
function createWindow() {
  // 指定されたサイズとWebプリファレンスで新しいブラウザウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // メインHTMLファイルをブラウザウィンドウに読み込ませる
  mainWindow.loadFile('index.html');

  // 指定されたオプションで新しいメニューを作成
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          // ファイルを開くオプション
          label: 'Open',
          accelerator: 'CmdOrCtrl+O', // このオプションをトリガーするキーボードショートカット
          click: async () => { // このオプションがクリックされたときに実行するアクション
            const result = await dialog.showOpenDialog(mainWindow, {
              filters: [{ name: 'JSON', extensions: ['json'] }],
              properties: ['openFile'],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('open-file', result.filePaths[0]); // 選択されたファイルを開くためにレンダラープロセスにメッセージを送信
              mainWindow.setTitle(path.basename(result.filePaths[0])); // ウィンドウのタイトルを開いたファイルの名前に設定
              currentFilePath = result.filePaths[0]; // 現在のファイルパス変数を更新
            }
          },
        },
        {
          // ファイルを保存するオプション
          label: 'Save',
          accelerator: 'CmdOrCtrl+S', // このオプションをトリガーするキーボードショートカット
          click: () => { // このオプションがクリックされたときに実行するアクション
            if (currentFilePath) {
              mainWindow.webContents.send('save-content', currentFilePath); // 現在のファイルの内容を保存するためにレンダラープロセスにメッセージを送信
            } else {
              mainWindow.webContents.send('save-content'); // 新しいファイルの内容を保存するためにレンダラープロセスにメッセージを送信
            }
          },
        },
        {
          // 別名でファイルを保存するオプション
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S', // このオプションをトリガーするキーボードショートカット
          click: async () => { // このオプションがクリックされたときに実行するアクション
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [{ name: 'JSON', extensions: ['json'] }],
            });
            if (!result.canceled) {
              mainWindow.webContents.send('save-content-as', result.filePath); // 新しいファイルとして内容を保存するためにレンダラープロセスにメッセージを送信
              mainWindow.setTitle(path.basename(result.filePath)); // ウィンドウのタイトルを保存したファイルの名前に設定
              currentFilePath = result.filePath; // 現在のファイルパス変数を更新
            }
          },
        },
      ],
    },
  ]);  
  Menu.setApplicationMenu(menu); // 作成したメニューをアプリケーションメニューに設定

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

// IPCハンドラー：ファイルの内容をディスクに保存する
ipcMain.handle('save-file', async (_, content, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2)); // 指定されたファイルパスにコンテンツを書き込む
});

// IPCハンドラー：別名でファイルの内容をディスクに保存する
ipcMain.handle('save-file-as', async (_, content) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters:[{ name: 'JSON', extensions: ['json'] }],
  }); if (!result.canceled) { fs.writeFileSync(result.filePath, JSON.stringify(content, null, 2)); mainWindow.setTitle(path.basename(result.filePath)); } });

// IPCハンドラー：ファイルを開いてその内容を返す
ipcMain.handle('open-file', async (_, filePath) => { const content = fs.readFileSync(filePath, 'utf-8'); return JSON.parse(content); });
