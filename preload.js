// Electronから必要なモジュールや関数をインポート
const { contextBridge, ipcRenderer } = require('electron');

// メインプロセスとレンダラープロセスの間で通信するために、IPCハンドラーを公開する
contextBridge.exposeInMainWorld('ipc', {
  saveFile: async (content, filePath) => {
    console.log(content, filePath + "save-file")
    await ipcRenderer.invoke('save-file', content, filePath); // メインプロセスにファイルの内容を保存するように指示する
  },
  // saveFileAs: async (content) => {
  //   console.log(content + "save-file-as")
  //   await ipcRenderer.invoke('save-file-as', content); // メインプロセスに新しいファイルとしてファイルの内容を保存するように指示する
  // },
  openFile: async (filePath) => {
    return await ipcRenderer.invoke('open-file', filePath); // 指定されたファイルを開いてその内容を返すようにメインプロセスに指示する
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback); // 指定されたチャネルでIPCイベントを受信するようにレンダラープロセスに指示する
  },

});
