
//初期化
const editor = new EditorJS({
  holder: 'editor',
  tools: {
    header: Header,
    list: List,
    marker: Marker,
    checklist: Checklist,
    quote: Quote,
    code: CodeTool,
    image: Image,
    embed: Embed,
    table: Table,
    delimiter: Delimiter,
    warning: Warning
  },
  onChange: () => {
    // main.jsに変更通知を送信
    window.ipc.send('text-changed', true);
  }
}); 


