const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipc', {
  saveFile: async (content, filePath) => {
    //ipcRenderer.invokeでメインプロセス（main.js）にデータ送信
    //チャンネル名（第一引数）:「'save-file'」
    //
    await ipcRenderer.invoke('save-file', content, filePath);
  },
  saveFileAs: async (content) => {
    await ipcRenderer.invoke('save-file-as', content);
  },
  openFile: async (filePath) => {
    return await ipcRenderer.invoke('open-file', filePath);
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },
  once: (channel, callback) => {
    ipcRenderer.once(channel, callback);
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});