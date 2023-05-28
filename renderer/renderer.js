

// ファイルのオープン
window.ipc.on('open-file', async (_, filePath) => {
  const content = await window.ipc.openFile(filePath); // 指定されたファイルを開いてその内容を取得するようにメインプロセスに指示する
  if (content) {
    await editor.render(content); // 取得した内容をエディターにレンダリングする
  }
});

// ファイルの保存
window.ipc.on('save-file', async (_, filePath) => {
  const outputData = await editor.save(); // エディターの現在の内容を取得する
  if (filePath) {
    await window.ipc.saveFile(outputData, filePath); // 現在の内容を指定されたファイルに保存するようにメインプロセスに指示する
  } else {  
    console.error("ファイルパスがおかしいです")
  }
});

// // 別名での保存
// window.ipc.on('save-file-as', async (_, filePath) => {
//   console.log(filePath + "renderer.js")
//   const outputData = await editor.save(); // エディターの現在の内容を取得する
//   await window.ipc.saveFile(outputData, filePath); // 現在の内容を指定されたファイルに保存するようにメインプロセスに指示する
// });


// アプリケーション終了時の保存
window.addEventListener('beforeunload', async (e) => {
  e.preventDefault(); // デフォルトの動作をキャンセルする
  await window.ipc.send('save-content'); // 現在の内容を保存するようにメインプロセスに指示する
});



//↓↓アプリ起動時に最後に開いていたファイルを読み込む機能。今のとこはいらない。

// 読み込み時のコンテンツレンダリング
// window.ipc.send('load-content'); // メインプロセスに現在開いているファイルの内容を取得するように指示する
