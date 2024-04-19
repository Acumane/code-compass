import * as vscode from 'vscode'

let dismissed: string[] = []

// Runs on ext activation:
export function activate(context: vscode.ExtensionContext) {
  const help = vscode.window.createTextEditorDecorationType({
    gutterIconPath: context.asAbsolutePath('src/help.svg'),
    gutterIconSize: 'contain'
  })

  // Array of all icons added to the active editor:
  let helpIcons: vscode.DecorationOptions[] = [],
  editor = vscode.window.activeTextEditor
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
    RE = /def\s+\w+\s*\(.*\):/g
    helpIcons = []
    let match

    // Find all function signatures in the active editor:
    while ((match = RE.exec(text))) {
      const signature = match[0]
      if (!dismissed.includes(signature)) {
        const line = editor.document.positionAt(match.index).line;
        const decoration: vscode.DecorationOptions = {
          range: editor.document.lineAt(line).range,
        }
        helpIcons.push(decoration)
      }
    }
    // use help.svg for each decroration in helpIcons
    editor.setDecorations(help, helpIcons)
  }

  function learn() {
    vscode.window.showInformationMessage('TODO')
  }

  // Watch for cursor movements:
  vscode.window.onDidChangeTextEditorSelection(event => {
    if (editor && event.textEditor === editor) {
      const position = event.selections[0].active,
      onFn = helpIcons.find(icon => icon.range.contains(position))

      if (onFn) {
        vscode.window.showInformationMessage('Learn about this function?', 'Start', 'Dismiss')
          .then(choice => {
            if (choice === 'Start') learn()
            else if (choice === 'Dismiss') {
              const sig = editor.document.getText(onFn.range)
              dismissed.push(sig)
              checkFns()
            }
          })
      }
    }
  }, null, context.subscriptions)
}
