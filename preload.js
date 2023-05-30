// Electronから必要なモジュールや関数をインポート
const { contextBridge, ipcRenderer } = require('electron');


// メインプロセスとレンダラープロセスの間で通信するために、IPCハンドラーを公開する
contextBridge.exposeInMainWorld('ipc', {
  saveFile: async (content, filePath) => {
    await ipcRenderer.invoke('save-file', content, filePath); // メインプロセスにファイルの内容を保存するように指示する
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback); // メインプロセスからのsendをレンダラープロセスがonで受け取るための記述。
  },
  // メインプロセスにメッセージを送信するメソッド
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
});
