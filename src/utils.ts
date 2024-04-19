import * as code from 'vscode'
import { help } from './extension'

type Deco = code.TextEditorDecorationType
type DecoOpts = code.DecorationOptions
export var dismissed: string[] = [],
helpPos: DecoOpts[] = [], dimmer: Deco, hl: Deco

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

export function hlLine(editor: code.TextEditor, line: number, content: string): void {
  const hlOpts: code.DecorationOptions = {
    range: new code.Range(line, 0, line, 0),
    renderOptions: {
      after: {
        contentText: `${content}`,
        color: new code.ThemeColor('foreground'),
        margin: '0 0 0 40px',
        fontStyle: 'italic',
      },
    },
  }
  hl = code.window.createTextEditorDecorationType({
    backgroundColor: '#FFA30440', isWholeLine: true,
  })

  editor.setDecorations(hl, [hlOpts])
}
