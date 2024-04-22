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
  let editor = code.window.activeTextEditor,
  prevLine: null | number = null, learning = false

  code.commands.registerCommand('compass.continue', (nextLine, config) => {
    utils.actions.dispose(); utils.hl.dispose()
    if (editor) utils.focus(editor, nextLine, config)
  })

  code.commands.registerCommand('compass.validate', (sol) => {} ) // TODO

  code.commands.registerCommand('compass.exit', () => {
    utils.dimmer.dispose(); utils.hl.dispose(); utils.actions.dispose()
    learning = false
  })

  if (editor) utils.checkFns(editor)

  code.window.onDidChangeActiveTextEditor(changed => {
    if (editor && changed) utils.checkFns(editor)
  }, null, context.subscriptions)

  code.workspace.onDidChangeTextDocument(changed => {
    if (editor && changed.document == editor.document) utils.checkFns(editor)
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
                let start = onFn.range.start.line 
                utils.dim(editor, start)
                utils.focus(editor, start, config)
                learning = true
                code.window.showInformationMessage('Learning', 'Done')
                .then(choice => {
                  if (choice == 'Done' && utils.dimmer) {
                    code.commands.executeCommand('compass.exit')
                  }
                })
              }
              else if (choice == 'Dismiss') {
                const sig = editor.document.getText(onFn.range)
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
