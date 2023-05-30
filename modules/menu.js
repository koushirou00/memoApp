const { Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');


function createMenu(mainWindow) {
  let currentFilePath = null;
  const menu = Menu.buildFromTemplate([
        {
          label: 'File',
          submenu: [
            {
              // ファイルを開く
              label: 'Open',
              accelerator: 'CmdOrCtrl+O', 
              click: () => openFile(),
            },
            {
              // ファイルを保存
              label: 'Save',
              accelerator: 'CmdOrCtrl+S', 
              click: () => saveFile(),
            },
            {
              // 別名でファイルを保存
              label: 'Save As',
              accelerator: 'CmdOrCtrl+Shift+S',
              click: ()=> saveFileAs(),
            },
          ],
        },
  ]); 

  //---------関数リスト--------

  // ファイルを開く
  async function openFile() { 
    try{
      //JSON形式のファイルを開くダイアログ
      const result = await dialog.showOpenDialog(mainWindow, {
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile'],
      });
      if (!result.canceled && result.filePaths.length > 0) {
        mainWindow.setTitle(path.basename(result.filePaths[0]));
        currentFilePath = result.filePaths[0];
        // ファイルの内容を読み取ってjavascript用のオブジェクトへ変換
        const jsonContent = fs.readFileSync(currentFilePath, 'utf-8');
        const content = JSON.parse(jsonContent);

        // ファイルパスと内容をレンダラープロセスに送信
        mainWindow.webContents.send('open-file', content);
      };
    } catch(e){
      console.error(e)
    }
  };

  //ファイルを保存
  function saveFile() { 
    return new Promise((async (resolve,reject)=> {
      try{
          if (currentFilePath) {
            mainWindow.webContents.send('save-file', currentFilePath); 
            resolve();
          } else {
            await saveFileAs();
            resolve();
          }
      }catch(e){
        console.error(e)
        reject(e);
      }
    }))
  };

  //名前をつけて保存
  function saveFileAs(){
    return new Promise((async (resolve,reject) => {
      try{
        const result = await dialog.showSaveDialog(mainWindow, {
            filters: [{ name: 'JSON', extensions: ['json'] }],
        });
        if (!result.canceled && result.filePath) {
          mainWindow.webContents.send('save-file', result.filePath); // 新しいファイルとして内容を保存するためにレンダラープロセスにメッセージを送信
          mainWindow.setTitle(path.basename(result.filePath)); // ウィンドウのタイトルを保存したファイルの名前に設定
          currentFilePath = result.filePath; // 現在のファイルパス変数を更新
          resolve();
        } else {
          resolve();
        }
      } catch(e){
        console.error(e)
        reject(e);
      }
    }))
  };

  Menu.setApplicationMenu(menu); //作成したメニューをアプリケーションメニューに設定

  //main.jsから特定の関数を呼び出す用
  return{
    saveFile: saveFile,
  }
}

module.exports = createMenu;
