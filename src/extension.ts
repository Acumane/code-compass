import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const help = vscode.window.createTextEditorDecorationType({
    gutterIconPath: context.asAbsolutePath('src/help.svg'),
    gutterIconSize: 'contain'
  })

  let editor = vscode.window.activeTextEditor
  if (editor) checkFns()

  vscode.window.onDidChangeActiveTextEditor(changed => {
    if (changed) checkFns()
  }, null, context.subscriptions)

  vscode.workspace.onDidChangeTextDocument(changed => {
    if (editor && changed.document === editor.document) checkFns()
  }, null, context.subscriptions)

  function checkFns() {
    if (!editor) return

    const text = editor.document.getText(),
    helpIcons: vscode.DecorationOptions[] = [],
    RE = /def\s+\w+\s*\(.*\):/g

    let match
    while ((match = RE.exec(text))) {
      const start = editor.document.positionAt(match.index)
      const end = editor.document.positionAt(match.index + match[0].length)
      const decoration: vscode.DecorationOptions = {
        range: new vscode.Range(start, end),
      }
      helpIcons.push(decoration)
    }

    editor.setDecorations(help, helpIcons)
  }
}