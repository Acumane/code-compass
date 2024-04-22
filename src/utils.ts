import * as code from 'vscode'
import { help } from './extension'
import { Config } from './input'

type Deco = code.TextEditorDecorationType
type DecoOpts = code.DecorationOptions
export var dismissed: string[] = [], helpPos: DecoOpts[] = [],
dimmer: Deco, hl: Deco, actions: code.Disposable

export function checkFns(editor: code.TextEditor): void {
  if (!editor) return

  const text = editor.document.getText(),
  RE = /def\s+\w+\s*\(.*\):/g
  helpPos = []
  let match

  // Find all function signatures in the active editor:
  while ((match = RE.exec(text))) {
    const signature = match[0]
    if (!dismissed.includes(signature)) {
      const line = editor.document.positionAt(match.index).line
      const decoration: code.DecorationOptions = {
        range: editor.document.lineAt(line).range,
      }
      helpPos.push(decoration)
    }
  }
  // use help.svg for each decroration in helpPos
  editor.setDecorations(help, helpPos)
}

export function dim(editor: code.TextEditor, start: number): void {
  const indents = editor.document.lineAt(start).firstNonWhitespaceCharacterIndex
  let i = start, len = editor.document.lineCount
  while (i++ < len - 1) {
    const line = editor.document.lineAt(i)
    // End of block: non-empty line with same or less indentation
    if (line.firstNonWhitespaceCharacterIndex <= indents && line.text.trim() !='') break
  }

  dimmer = code.window.createTextEditorDecorationType({ opacity: '0.25' })
  const dimRanges: code.Range[] = []
  if (start > 0) dimRanges.push(new code.Range(0, 0, start, 0))
  if (i < len)   dimRanges.push(new code.Range(i, 0, len, 0))
  editor.setDecorations(dimmer, dimRanges)
}

export function focus(editor: code.TextEditor, start: number, config: Config): void {
  let color, i, desc, remLen = Object.keys(config['line-desc']).length
  // keep passing the config object (reference), "popleft"-ing tasks:
  if (remLen == 0) { // Tutorial complete, begin task
    i = 0; desc = config['task']['desc']; color = "#FFA30440"
  } else {
    i = Number(Object.keys(config['line-desc'])[0]);
    desc = config['line-desc'][String(i)]; delete config['line-desc'][String(i)]
    color = "#D7E7B399"
  }
  console.log(Object.keys(config['task']).length)
  // expects Range (we just care about the line):
  const lineRange = new code.Range(start+i, 0, start+i, 0)
  const hlOpts: code.DecorationOptions = {
    range: lineRange,
    renderOptions: {
      after: {
        contentText: desc,
        color: new code.ThemeColor('foreground'),
        margin: '0 0 0 40px',
        fontStyle: 'italic',
      },
    },
  }
  hl = code.window.createTextEditorDecorationType({
    backgroundColor: color,
    isWholeLine: true,
  })
  editor.setDecorations(hl, [hlOpts])

  actions = code.languages.registerCodeLensProvider('python', {
    provideCodeLenses: () => [
      (remLen) ?
      new code.CodeLens(lineRange, {
        title: '↴ Continue',
        command: 'compass.continue',
        arguments: [start, config], // will call focus() again
      }) :
      new code.CodeLens(lineRange, {
        title: '🗸 Validate',
        command: 'compass.validate',
        arguments: [config['task']['out']] // TODO
      }),
      new code.CodeLens(lineRange, {
        title: '⨯ Exit',
        command: 'compass.exit',
      })
    ],
  })
}
