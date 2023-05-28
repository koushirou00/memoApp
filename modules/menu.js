const { Menu, dialog } = require('electron');
const path = require('path');


function createMenu(mainWindow) {
  let currentFilePath = null;
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
                  mainWindow.setTitle(path.basename(result.filePaths[0])); // ウィンドウのタイトルを開いたファイルの名前に設定
                  currentFilePath = result.filePaths[0]; // 現在のファイルパス変数を更新
                  mainWindow.webContents.send('open-file', result.filePaths[0]); // 選択されたファイルを開くためにレンダラープロセスにメッセージを送信
                }
              },
            },
            {
              // ファイルを保存するオプション
              label: 'Save',
              accelerator: 'CmdOrCtrl+S', // このオプションをトリガーするキーボードショートカット
              click: () => { // このオプションがクリックされたときに実行するアクション
                if (currentFilePath) {
                  mainWindow.webContents.send('save-file', currentFilePath); // 現在のファイルの内容を保存するためにレンダラープロセスにメッセージを送信
                } else {
                  saveFileAs();
                }
              },
            },
            {
              // 別名でファイルを保存するオプション
              label: 'Save As',
              accelerator: 'CmdOrCtrl+Shift+S', // このオプションをトリガーするキーボードショートカット
              click: ()=> saveFileAs(),
            },
          ],
        },
      ]); 

      async function saveFileAs(){
        const result = await dialog.showSaveDialog(mainWindow, {
            filters: [{ name: 'JSON', extensions: ['json'] }],
          });
          if (!result.canceled && result.filePath) {
            mainWindow.webContents.send('save-file', result.filePath); // 新しいファイルとして内容を保存するためにレンダラープロセスにメッセージを送信
            mainWindow.setTitle(path.basename(result.filePath)); // ウィンドウのタイトルを保存したファイルの名前に設定
            currentFilePath = result.filePath; // 現在のファイルパス変数を更新
            console.log(`${result.filePath}ここで表示。manu.js`);
          }
      }

  Menu.setApplicationMenu(menu); // 作成したメニューをアプリケーションメニューに設定
}

module.exports = createMenu;
