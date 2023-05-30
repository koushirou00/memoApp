// // ファイルのオープン
window.ipc.on('open-file', async (_, content) => {
  try{
    // ファイルの内容をエディタにレンダリングする
    if (content) {
      await editor.render(content);
      window.ipc.send('text-changed', false);
    }
  } catch(e){
    console.error(e)
  }
});

// ファイルの保存
window.ipc.on('save-file', async (_, filePath) => {
  try{
    const content = await editor.save(); //エディターの現在の内容を取得する
    if (filePath) {
      await window.ipc.saveFile(content, filePath); // 現在の内容を指定されたファイルに保存するようにメインプロセスに指示する
    } else {
      alert("ファイルを選択してください")
    }
  } catch(e){
    console.error(e)
  }
});


