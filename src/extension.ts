import * as code from 'vscode'
import * as utils from './utils'
import * as input from './input'

type Deco = code.TextEditorDecorationType
export var help: Deco, config: input.Config

// Runs on ext activation:
export function activate(context: code.ExtensionContext) {
  help = code.window.createTextEditorDecorationType({
    gutterIconPath: context.asAbsolutePath('src/help.svg'),
  })

  input.readConfig().then((JSON) => config = JSON)

  // Array of all icons added to the active editor:
  let editor = code.window.activeTextEditor as code.TextEditor,
  prevLine: null | number = null, learning = false, origEditor: code.TextEditor

  code.commands.registerCommand('compass.continue', (nextLine, config) => {
    utils.actions.dispose(); utils.hl.dispose()
    if (editor) {
      utils.focus(editor, nextLine, config)
      code.commands.executeCommand('workbench.action.debug.stepOver')
    }
  })

  code.commands.registerCommand('compass.validate', (sol) => {} ) // TODO

  code.commands.registerCommand('compass.exit', (start) => {
    utils.dimmer.dispose(); utils.hl.dispose(); utils.actions.dispose()
    learning = false; editor.hide()
    if (editor) utils.exitDebugger(editor, start)
    code.window.showTextDocument(origEditor.document)
  })

  if (editor) utils.checkFns(editor)

code.window.onDidChangeActiveTextEditor(changed => {
  if (changed && changed.document.languageId === 'python') {
    const inWorkspace = code.workspace.getWorkspaceFolder(changed.document.uri)!.name
    if (inWorkspace) { // ignore change to tmp file
      editor = code.window.activeTextEditor!
      utils.checkFns(editor)
    }
  }
}, null, context.subscriptions);

  code.workspace.onDidChangeTextDocument(changed => {
    if (editor && changed.document == editor.document
        && changed.document.languageId === 'python') utils.checkFns(editor)
  }, null, context.subscriptions)

  // Watch for cursor movements:
  code.window.onDidChangeTextEditorSelection(event => {
    if (editor && event.textEditor == editor) {
      const position = event.selections[0].active

      if (prevLine != position.line) { // only check on line change
        const onFn = utils.helpPos.find(icon => icon.range.contains(position))
        if (onFn && !learning) {
          code.window.showInformationMessage('Learn about this function?', 'Start', 'Dismiss')
            .then(choice => {
              if (choice == 'Start') {
                let fnStart = onFn.range.start.line; origEditor = editor
                utils.sandbox(editor, fnStart).then(tmpStart => {
                  editor.hide() // hide original editor
                  editor = code.window.activeTextEditor as code.TextEditor
                  utils.dim(editor, tmpStart)
                  utils.focus(editor, tmpStart, config)
                  utils.startDebugger(editor, tmpStart)
                  learning = true
                  code.window.showInformationMessage('Learning')
                })
              }
              else if (choice == 'Dismiss') {
                const sig = editor.document.getText(onFn.range)
                code.commands.executeCommand('compass.exit', onFn.range.start.line)
                utils.dismissed.push(sig)
                utils.checkFns(editor)
              }
            })
        }
      }
      prevLine = position.line
    }
  }, null, context.subscriptions)
}
