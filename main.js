const { app, BrowserWindow, ipcMain, dialog} = require('electron');
const fs = require('fs');
const path = require('path');

//モジュール
const createMenu = require("./modules/menu.js")

//mainWindowの変数宣言
let mainWindow;

//テキスト内容の変更を監視
let isTextChanged = false;


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
  mainWindow.loadFile('./renderer/index.html');

  //menuを呼び出し
  const menu = createMenu(mainWindow);
  

  // ウィンドウが閉じられる前のイベントリスナー
  mainWindow.on('close', (e) => {
    console.log(isTextChanged + "ウィンドウが閉じられる前のイベントリスナー")
    if (isTextChanged) {
      e.preventDefault(); // ウィンドウの閉じる操作を一時停止
      const dialogOpts = {
        type: 'info',
        buttons: ['保存する', '保存しない', "キャンセル"],
        title: 'メモ帳',
        message: `変更内容が保存されていません。保存しますか？`
      };
      dialog.showMessageBox(mainWindow, dialogOpts).then(({ response }) => {
        if (response === 0) { // '保存する' を選択した場合
          (async () => {
            await menu.saveFile();
            setTimeout(() => {
              console.log(`${isTextChanged}save後で変更前`)
              isTextChanged = false;
              console.log(`${isTextChanged}save後で変更後`)
              mainWindow.close();
            }, 0);
          })();
        } else if (response === 1) { // "保存しない"を選択した場合
          isTextChanged = false; // テキストが変更されていないとマーク
          mainWindow.close(); // ウィンドウを再度閉じる
        }
      });
    }else {
      return;
    }
  });

  // ウィンドウが閉じられたあとのイベントリスナー
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

ipcMain.handle('save-file', async (_, content, filePath) => {
  console.log(`${isTextChanged}IPC1回目`)
  isTextChanged = false;
  console.log(`${isTextChanged}IPC2回目`)
  await fs.promises.writeFile(filePath, JSON.stringify(content, null, 2)); // ファイルに内容を書き込む
});



// IPCリスナー：テキスト内容の変更を受信する
ipcMain.on('text-changed', (_, boolean) => {
  isTextChanged = boolean; // 受け取った値を変数に代入
  console.log(isTextChanged)
});




