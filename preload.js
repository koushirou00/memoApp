// Electronから必要なモジュールや関数をインポート
const { contextBridge, ipcRenderer } = require('electron');

// メインプロセスとレンダラープロセスの間で通信するために、IPCハンドラーを公開する
contextBridge.exposeInMainWorld('ipc', {
  saveFile: async (content, filePath) => {
    await ipcRenderer.invoke('save-file', content, filePath); // メインプロセスにファイルの内容を保存するように指示する
  },
  saveFileAs: async (content) => {
    await ipcRenderer.invoke('save-file-as', content); // メインプロセスに新しいファイルとしてファイルの内容を保存するように指示する
  },
  openFile: async (filePath) => {
    return await ipcRenderer.invoke('open-file', filePath); // 指定されたファイルを開いてその内容を返すようにメインプロセスに指示する
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback); // 指定されたチャネルでIPCイベントを受信するようにレンダラープロセスに指示する
  },
  once: (channel, callback) => {
    ipcRenderer.once(channel, callback); // 指定されたチャネルで一度だけIPCイベントを受信するようにレンダラープロセスに指示する
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback); // 指定されたチャネルからIPCリスナーを削除するようにレンダラープロセスに指示する
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel); // 指定されたチャネルのすべてのIPCリスナーを削除するようにレンダラープロセスに指示する
  },
});
